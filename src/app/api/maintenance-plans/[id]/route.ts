import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const plan = await db.maintenancePlan.findUnique({
        where: { id },
        include: {
          equipment: {
            select: { name: true, code: true, criticality: true, status: true, site: { select: { name: true, code: true } } }
          },
          tasks: { orderBy: { order: 'asc' } },
        },
      });

      if (!plan) {
        return Response.json({ error: 'Plan de maintenance non trouvé' }, { status: 404 });
      }

      return Response.json(plan);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const body = await request.json();

      const existing = await db.maintenancePlan.findUnique({ where: { id } });
      if (!existing) {
        return Response.json({ error: 'Plan de maintenance non trouvé' }, { status: 404 });
      }

      // If tasks are provided, replace them
      if (body.tasks) {
        await db.maintenancePlanTask.deleteMany({ where: { planId: id } });
      }

      const plan = await db.maintenancePlan.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.type !== undefined && { type: body.type }),
          ...(body.frequency !== undefined && { frequency: body.frequency }),
          ...(body.frequencyValue !== undefined && { frequencyValue: body.frequencyValue }),
          ...(body.nextDueDate !== undefined && { nextDueDate: new Date(body.nextDueDate) }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.estimatedDuration !== undefined && { estimatedDuration: body.estimatedDuration }),
          ...(body.tasks && {
            tasks: {
              create: body.tasks.map((task: any, index: number) => ({
                description: task.description,
                order: task.order ?? index,
                isRequired: task.isRequired ?? true,
                estimatedMinutes: task.estimatedMinutes,
              })),
            },
          }),
        },
        include: {
          equipment: { select: { name: true, code: true } },
          tasks: { orderBy: { order: 'asc' } },
        },
      });

      return Response.json(plan);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'RESP_MAINTENANCE'] }
);

export const DELETE = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const existing = await db.maintenancePlan.findUnique({ where: { id } });
      if (!existing) {
        return Response.json({ error: 'Plan de maintenance non trouvé' }, { status: 404 });
      }

      await db.maintenancePlan.delete({ where: { id } });

      return Response.json({ message: 'Plan de maintenance supprimé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
