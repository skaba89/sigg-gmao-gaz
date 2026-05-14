import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';
    if (lowStock === 'true') {
      // Can't compare two columns in Prisma where clause - will filter after query
      // Set a reasonable threshold for low stock filter
      where.currentStock = { lte: 5 };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { partNumber: { contains: search } },
        { manufacturer: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.part.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: {
          category: { select: { name: true, code: true } },
          warehouseStock: {
            include: { warehouse: { select: { name: true, code: true } } },
          },
        },
      }),
      db.part.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.code || !body.categoryId) {
      return Response.json({ error: 'Nom, code et catégorie requis' }, { status: 400 });
    }

    const part = await db.part.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        categoryId: body.categoryId,
        manufacturer: body.manufacturer,
        partNumber: body.partNumber,
        unit: body.unit || 'unite',
        unitPrice: body.unitPrice || 0,
        minStockLevel: body.minStockLevel || 0,
        maxStockLevel: body.maxStockLevel,
        currentStock: body.currentStock || 0,
        reorderPoint: body.reorderPoint,
        leadTimeDays: body.leadTimeDays,
        imageUrl: body.imageUrl,
        specifications: body.specifications,
        isActive: body.isActive ?? true,
      },
      include: {
        category: { select: { name: true, code: true } },
      },
    });

    return Response.json(part, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Code pièce déjà existant' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
