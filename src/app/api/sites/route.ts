import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');

    const where: any = {};
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';
    if (type) where.type = type;

    const sites = await db.site.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            equipment: true,
            workOrders: true,
            incidents: true,
            users: true,
            warehouses: true,
          },
        },
      },
    });

    return Response.json({ data: sites });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.code) {
      return Response.json({ error: 'Nom et code requis' }, { status: 400 });
    }

    const site = await db.site.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        city: body.city,
        country: body.country || 'Guinée',
        latitude: body.latitude,
        longitude: body.longitude,
        type: body.type || 'DISTRIBUTION',
        isActive: body.isActive ?? true,
      },
    });

    return Response.json(site, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Code site déjà existant' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
