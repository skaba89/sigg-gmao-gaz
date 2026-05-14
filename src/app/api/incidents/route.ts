import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const siteId = searchParams.get('siteId');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const equipmentId = searchParams.get('equipmentId');
    const search = searchParams.get('search');

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (equipmentId) where.equipmentId = equipmentId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.incident.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: { select: { name: true, code: true, criticality: true } },
          site: { select: { name: true, code: true } },
          reportedBy: { select: { id: true, name: true, role: true } },
          workOrder: { select: { code: true, title: true, status: true } },
        },
      }),
      db.incident.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.equipmentId || !body.siteId || !body.reportedById) {
      return Response.json({ error: 'Titre, équipement, site et rapporteur requis' }, { status: 400 });
    }

    // Generate code
    const count = await db.incident.count();
    const code = `INC-${String(count + 1).padStart(5, '0')}`;

    const incident = await db.incident.create({
      data: {
        code,
        title: body.title,
        description: body.description,
        equipmentId: body.equipmentId,
        siteId: body.siteId,
        reportedById: body.reportedById,
        severity: body.severity || 'MAJEURE',
        status: body.status || 'OUVERT',
        detectedAt: body.detectedAt ? new Date(body.detectedAt) : new Date(),
        rootCause: body.rootCause,
        correctiveAction: body.correctiveAction,
        workOrderId: body.workOrderId,
      },
      include: {
        equipment: { select: { name: true, code: true } },
        site: { select: { name: true, code: true } },
        reportedBy: { select: { name: true } },
        workOrder: { select: { code: true, title: true } },
      },
    });

    return Response.json(incident, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Code incident déjà existant' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
