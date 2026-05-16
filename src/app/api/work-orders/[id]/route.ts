import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, updateWorkOrderSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const workOrder = await db.workOrder.findUnique({
        where: { id, deletedAt: null },
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'TECHNICIEN'] }
);

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const data = validateOrThrow(updateWorkOrderSchema, body);

      const existing = await db.workOrder.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Ordre de travail non trouvé' }, { status: 404 });
      }

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
      if (data.requestedById !== undefined) updateData.requestedById = data.requestedById;
      if (data.supervisorId !== undefined) updateData.supervisorId = data.supervisorId;
      if (data.plannedStartDate !== undefined) updateData.plannedStartDate = data.plannedStartDate ? new Date(data.plannedStartDate) : null;
      if (data.plannedEndDate !== undefined) updateData.plannedEndDate = data.plannedEndDate ? new Date(data.plannedEndDate) : null;
      if (data.actualStartDate !== undefined) updateData.actualStartDate = data.actualStartDate ? new Date(data.actualStartDate) : null;
      if (data.actualEndDate !== undefined) updateData.actualEndDate = data.actualEndDate ? new Date(data.actualEndDate) : null;
      if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
      if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.signatureUrl !== undefined) updateData.signatureUrl = data.signatureUrl;
      if (data.reportPdfUrl !== undefined) updateData.reportPdfUrl = data.reportPdfUrl;

      const workOrder = await db.workOrder.update({
        where: { id },
        data: updateData,
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
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);

export const DELETE = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const existing = await db.workOrder.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Ordre de travail non trouvé' }, { status: 404 });
      }

      await db.workOrder.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return Response.json({ message: 'Ordre de travail supprimé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
