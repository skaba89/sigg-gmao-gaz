import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const sensorId = searchParams.get('sensorId');
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '50');

      const where: any = {};
      if (status) where.type = status;
      if (sensorId) where.sensorId = sensorId;

      const [alerts, total] = await Promise.all([
        db.ioTAlert.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            sensor: {
              select: { name: true, code: true, unit: true, site: { select: { name: true } } },
            },
            acknowledgedBy: { select: { name: true } },
          },
        }),
        db.ioTAlert.count({ where }),
      ]);

      return Response.json({ data: alerts, total, page, pageSize });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
