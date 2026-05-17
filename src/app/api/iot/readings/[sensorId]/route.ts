import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { sensorId } = await context.params;
      const { searchParams } = new URL(request.url);
      const minutes = parseInt(searchParams.get('minutes') || '30');
      const limit = parseInt(searchParams.get('limit') || '100');

      // Check if the sensor exists
      const sensor = await db.ioTSensor.findUnique({
        where: { id: sensorId },
        select: { id: true, name: true, unit: true },
      });

      if (!sensor) {
        return Response.json({ error: 'Capteur non trouvé' }, { status: 404 });
      }

      // Query readings from the database
      const since = new Date(Date.now() - minutes * 60 * 1000);
      const readings = await db.ioTReading.findMany({
        where: {
          sensorId,
          recordedAt: { gte: since },
        },
        orderBy: { recordedAt: 'asc' },
        take: limit,
      });

      return Response.json({
        sensorId,
        sensorName: sensor.name,
        unit: sensor.unit,
        readings,
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
