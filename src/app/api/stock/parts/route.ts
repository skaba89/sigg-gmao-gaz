import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createPartSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const categoryId = searchParams.get('categoryId');
      const search = searchParams.get('search');
      const lowStock = searchParams.get('lowStock');
      const isActive = searchParams.get('isActive');

      const where: any = { deletedAt: null };
      if (categoryId) where.categoryId = categoryId;
      if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';
      if (lowStock === 'true') {
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK', 'RESP_MAINTENANCE'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createPartSchema, body);

      const part = await db.part.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          categoryId: data.categoryId,
          manufacturer: data.manufacturer,
          partNumber: data.partNumber,
          unit: data.unit || 'unite',
          unitPrice: data.unitPrice ?? 0,
          minStockLevel: data.minStockLevel ?? 0,
          maxStockLevel: data.maxStockLevel,
          currentStock: data.currentStock ?? 0,
          reorderPoint: data.reorderPoint,
          leadTimeDays: data.leadTimeDays,
          imageUrl: data.imageUrl,
          specifications: data.specifications,
          isActive: data.isActive ?? true,
        },
        include: {
          category: { select: { name: true, code: true } },
        },
      });

      return Response.json(part, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code pièce déjà existant' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);
