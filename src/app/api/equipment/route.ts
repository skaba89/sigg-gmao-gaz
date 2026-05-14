import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const criticality = searchParams.get('criticality');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;
    if (criticality) where.criticality = criticality;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { serialNumber: { contains: search } },
        { manufacturer: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.equipment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, code: true, icon: true } },
          site: { select: { name: true, code: true, city: true } },
          zone: { select: { name: true, code: true } },
        },
      }),
      db.equipment.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const equipment = await db.equipment.create({
      data: {
        name: body.name,
        code: body.code,
        serialNumber: body.serialNumber,
        categoryId: body.categoryId,
        siteId: body.siteId,
        zoneId: body.zoneId,
        manufacturer: body.manufacturer,
        model: body.model,
        year: body.year,
        criticality: body.criticality || 'MOYENNE',
        status: body.status || 'OPERATIONNEL',
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        installationDate: body.installationDate ? new Date(body.installationDate) : undefined,
        warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : undefined,
        expectedLifespan: body.expectedLifespan,
        currentHealthScore: body.currentHealthScore ?? 100,
        qrCode: body.qrCode,
        description: body.description,
        imageUrl: body.imageUrl,
        latitude: body.latitude,
        longitude: body.longitude,
      },
      include: {
        category: true,
        site: { select: { name: true, code: true } },
        zone: { select: { name: true, code: true } },
      },
    });

    return Response.json(equipment, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Code équipement déjà existant' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
