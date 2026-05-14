import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workOrder = await db.workOrder.findUnique({
      where: { id },
      include: {
        equipment: {
          select: { name: true, code: true, criticality: true, status: true, currentHealthScore: true, site: { select: { name: true } } }
        },
        site: { select: { name: true, code: true, city: true } },
        assignedTo: { select: { id: true, name: true, role: true, phone: true } },
        requestedBy: { select: { id: true, name: true, role: true } },
        supervisor: { select: { id: true, name: true, role: true } },
        parts: {
          include: { part: { select: { name: true, code: true, unit: true, unitPrice: true } } }
        },
        checklists: {
          include: { completedBy: { select: { name: true } } },
          orderBy: { id: 'asc' }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
        },
        stockMovements: {
          include: { part: { select: { name: true } }, warehouse: { select: { name: true } } },
        },
        maintenanceCosts: true,
        incidents: {
          include: { reportedBy: { select: { name: true } } },
        },
      },
    });

    if (!workOrder) {
      return Response.json({ error: 'Ordre de travail non trouvé' }, { status: 404 });
    }

    return Response.json(workOrder);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.workOrder.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Ordre de travail non trouvé' }, { status: 404 });
    }

    const workOrder = await db.workOrder.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId }),
        ...(body.supervisorId !== undefined && { supervisorId: body.supervisorId }),
        ...(body.plannedStartDate !== undefined && { plannedStartDate: body.plannedStartDate ? new Date(body.plannedStartDate) : null }),
        ...(body.plannedEndDate !== undefined && { plannedEndDate: body.plannedEndDate ? new Date(body.plannedEndDate) : null }),
        ...(body.actualStartDate !== undefined && { actualStartDate: body.actualStartDate ? new Date(body.actualStartDate) : null }),
        ...(body.actualEndDate !== undefined && { actualEndDate: body.actualEndDate ? new Date(body.actualEndDate) : null }),
        ...(body.estimatedHours !== undefined && { estimatedHours: body.estimatedHours }),
        ...(body.actualHours !== undefined && { actualHours: body.actualHours }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.signatureUrl !== undefined && { signatureUrl: body.signatureUrl }),
        ...(body.reportPdfUrl !== undefined && { reportPdfUrl: body.reportPdfUrl }),
      },
      include: {
        equipment: { select: { name: true, code: true } },
        site: { select: { name: true, code: true } },
        assignedTo: { select: { name: true } },
        requestedBy: { select: { name: true } },
        supervisor: { select: { name: true } },
      },
    });

    return Response.json(workOrder);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await db.workOrder.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Ordre de travail non trouvé' }, { status: 404 });
    }

    await db.workOrder.delete({ where: { id } });

    return Response.json({ message: 'Ordre de travail supprimé avec succès' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
