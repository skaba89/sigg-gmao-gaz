import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const alert = await db.ioTAlert.findUnique({
        where: { id },
        include: {
          sensor: {
            select: { name: true, code: true, unit: true, site: { select: { name: true } } },
          },
          acknowledgedBy: { select: { name: true } },
        },
      });

      if (!alert) {
        return Response.json({ error: 'Alerte non trouvée' }, { status: 404 });
      }

      return Response.json(alert);
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

      const existing = await db.ioTAlert.findUnique({ where: { id } });
      if (!existing) {
        return Response.json({ error: 'Alerte non trouvée' }, { status: 404 });
      }

      const alert = await db.ioTAlert.update({
        where: { id },
        data: {
          ...(body.isAcknowledged !== undefined && {
            isAcknowledged: body.isAcknowledged,
            acknowledgedAt: body.isAcknowledged ? new Date() : null,
            acknowledgedById: body.isAcknowledged ? user.userId : null,
          }),
        },
        include: {
          sensor: { select: { name: true, code: true, unit: true } },
          acknowledgedBy: { select: { name: true } },
        },
      });

      return Response.json(alert);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'RESP_MAINTENANCE'] }
);
