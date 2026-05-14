import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const siteId = searchParams.get('siteId');
    const type = searchParams.get('type');
    const workOrderId = searchParams.get('workOrderId');
    const equipmentId = searchParams.get('equipmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (type) where.type = type;
    if (workOrderId) where.workOrderId = workOrderId;
    if (equipmentId) where.equipmentId = equipmentId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      db.maintenanceCost.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
        include: {
          workOrder: { select: { code: true, title: true } },
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
        },
      }),
      db.maintenanceCost.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.siteId || !body.type || !body.amount) {
      return Response.json({ error: 'Site, type et montant requis' }, { status: 400 });
    }

    const cost = await db.maintenanceCost.create({
      data: {
        workOrderId: body.workOrderId,
        equipmentId: body.equipmentId,
        siteId: body.siteId,
        type: body.type,
        amount: body.amount,
        currency: body.currency || 'GNF',
        date: body.date ? new Date(body.date) : new Date(),
        description: body.description,
      },
      include: {
        workOrder: { select: { code: true, title: true } },
        equipment: { select: { name: true, code: true } },
        site: { select: { name: true, code: true } },
      },
    });

    return Response.json(cost, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
