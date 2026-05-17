import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const sensor = await db.ioTSensor.findUnique({
        where: { id },
        include: {
          equipment: { select: { name: true, code: true, criticality: true, status: true } },
          site: { select: { name: true, code: true } },
        },
      });

      if (!sensor) {
        return Response.json({ error: 'Capteur non trouvé' }, { status: 404 });
      }

      return Response.json(sensor);
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

      const existing = await db.ioTSensor.findUnique({ where: { id } });
      if (!existing) {
        return Response.json({ error: 'Capteur non trouvé' }, { status: 404 });
      }

      const sensor = await db.ioTSensor.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.type !== undefined && { type: body.type }),
          ...(body.unit !== undefined && { unit: body.unit }),
          ...(body.minValue !== undefined && { minValue: body.minValue }),
          ...(body.maxValue !== undefined && { maxValue: body.maxValue }),
          ...(body.alertLow !== undefined && { alertLow: body.alertLow }),
          ...(body.alertHigh !== undefined && { alertHigh: body.alertHigh }),
          ...(body.criticalLow !== undefined && { criticalLow: body.criticalLow }),
          ...(body.criticalHigh !== undefined && { criticalHigh: body.criticalHigh }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
        include: {
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
        },
      });

      return Response.json(sensor);
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

      const existing = await db.ioTSensor.findUnique({ where: { id } });
      if (!existing) {
        return Response.json({ error: 'Capteur non trouvé' }, { status: 404 });
      }

      // Soft delete: mark as inactive instead of hard delete
      await db.ioTSensor.update({
        where: { id },
        data: { isActive: false },
      });

      return Response.json({ message: 'Capteur désactivé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
