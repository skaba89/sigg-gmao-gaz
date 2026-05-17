import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createIoTSensorSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const siteId = searchParams.get('siteId');
      const type = searchParams.get('type');
      const status = searchParams.get('status');

      const where: any = { isActive: true };
      if (siteId) where.siteId = siteId;
      if (type) where.type = type;
      if (status) where.status = status;

      const sensors = await db.ioTSensor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
          _count: { select: { alerts: { where: { isAcknowledged: false } } } },
        },
      });

      return Response.json(sensors);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createIoTSensorSchema, body);

      const sensor = await db.ioTSensor.create({
        data: {
          code: data.code,
          name: data.name,
          type: data.type,
          unit: data.unit,
          equipmentId: data.equipmentId,
          siteId: data.siteId,
          minValue: data.minValue,
          maxValue: data.maxValue,
          alertLow: data.alertLow,
          alertHigh: data.alertHigh,
          criticalLow: data.criticalLow,
          criticalHigh: data.criticalHigh,
          status: 'offline',
          battery: 100,
          signal: 0,
        },
        include: {
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
        },
      });

      return Response.json(sensor, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code capteur déjà existant' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'RESP_MAINTENANCE'] }
);
