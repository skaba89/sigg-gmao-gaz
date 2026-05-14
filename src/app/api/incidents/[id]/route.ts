import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const incident = await db.incident.findUnique({
      where: { id },
      include: {
        equipment: {
          select: { name: true, code: true, criticality: true, status: true, site: { select: { name: true } } }
        },
        site: { select: { name: true, code: true, city: true } },
        reportedBy: { select: { id: true, name: true, role: true, phone: true } },
        workOrder: {
          include: {
            assignedTo: { select: { name: true } },
          },
        },
      },
    });

    if (!incident) {
      return Response.json({ error: 'Incident non trouvé' }, { status: 404 });
    }

    return Response.json(incident);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.incident.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Incident non trouvé' }, { status: 404 });
    }

    const incident = await db.incident.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.severity !== undefined && { severity: body.severity }),
        ...(body.status !== undefined && {
          status: body.status,
          resolvedAt: body.status === 'RESOLU' || body.status === 'CLOTURE' ? new Date() : existing.resolvedAt,
        }),
        ...(body.rootCause !== undefined && { rootCause: body.rootCause }),
        ...(body.correctiveAction !== undefined && { correctiveAction: body.correctiveAction }),
        ...(body.workOrderId !== undefined && { workOrderId: body.workOrderId }),
      },
      include: {
        equipment: { select: { name: true, code: true } },
        site: { select: { name: true, code: true } },
        reportedBy: { select: { name: true } },
        workOrder: { select: { code: true, title: true } },
      },
    });

    return Response.json(incident);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
