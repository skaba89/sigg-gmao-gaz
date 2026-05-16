import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, updateIncidentSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const incident = await db.incident.findUnique({
        where: { id, deletedAt: null },
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'TECHNICIEN'] }
);

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const data = validateOrThrow(updateIncidentSchema, body);

      const existing = await db.incident.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Incident non trouvé' }, { status: 404 });
      }

      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.severity !== undefined) updateData.severity = data.severity;
      if (data.status !== undefined) {
        updateData.status = data.status;
        if (data.status === 'RESOLU' || data.status === 'CLOTURE') {
          updateData.resolvedAt = new Date();
        }
      }
      if (data.rootCause !== undefined) updateData.rootCause = data.rootCause;
      if (data.correctiveAction !== undefined) updateData.correctiveAction = data.correctiveAction;
      if (data.workOrderId !== undefined) updateData.workOrderId = data.workOrderId;

      const incident = await db.incident.update({
        where: { id },
        data: updateData,
        include: {
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
          reportedBy: { select: { name: true } },
          workOrder: { select: { code: true, title: true } },
        },
      });

      return Response.json(incident);
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

      const existing = await db.incident.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Incident non trouvé' }, { status: 404 });
      }

      await db.incident.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return Response.json({ message: 'Incident supprimé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
