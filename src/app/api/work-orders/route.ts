import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const equipmentId = searchParams.get('equipmentId');
    const search = searchParams.get('search');

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (equipmentId) where.equipmentId = equipmentId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.workOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: { select: { name: true, code: true, criticality: true } },
          site: { select: { name: true, code: true } },
          assignedTo: { select: { id: true, name: true, role: true } },
          requestedBy: { select: { id: true, name: true } },
          supervisor: { select: { id: true, name: true } },
          parts: { include: { part: { select: { name: true, code: true, unit: true } } } },
          checklists: true,
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
      }),
      db.workOrder.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generate code
    const count = await db.workOrder.count();
    const code = `OT-${String(count + 1).padStart(5, '0')}`;

    const workOrder = await db.workOrder.create({
      data: {
        code,
        title: body.title,
        description: body.description,
        type: body.type || 'CORRECTIVE',
        status: body.status || 'EN_ATTENTE',
        priority: body.priority || 'P3_MOYENNE',
        equipmentId: body.equipmentId,
        siteId: body.siteId,
        assignedToId: body.assignedToId,
        requestedById: body.requestedById,
        supervisorId: body.supervisorId,
        plannedStartDate: body.plannedStartDate ? new Date(body.plannedStartDate) : undefined,
        plannedEndDate: body.plannedEndDate ? new Date(body.plannedEndDate) : undefined,
        estimatedHours: body.estimatedHours,
        notes: body.notes,
      },
      include: {
        equipment: { select: { name: true, code: true } },
        site: { select: { name: true, code: true } },
        assignedTo: { select: { name: true } },
        requestedBy: { select: { name: true } },
        supervisor: { select: { name: true } },
      },
    });

    return Response.json(workOrder, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Code ordre de travail déjà existant' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
