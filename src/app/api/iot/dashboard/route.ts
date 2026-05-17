import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      // Aggregate IoT dashboard data from the database
      const [
        totalSensors,
        onlineSensors,
        warningSensors,
        criticalSensors,
        offlineSensors,
        activeAlerts,
        unacknowledgedAlerts,
        avgBattery,
        avgSignal,
        sitesWithSensors,
      ] = await Promise.all([
        db.ioTSensor.count({ where: { isActive: true } }),
        db.ioTSensor.count({ where: { isActive: true, status: 'online' } }),
        db.ioTSensor.count({ where: { isActive: true, status: 'warning' } }),
        db.ioTSensor.count({ where: { isActive: true, status: 'critical' } }),
        db.ioTSensor.count({ where: { isActive: true, status: 'offline' } }),
        db.ioTAlert.count({ where: { isAcknowledged: false } }),
        db.ioTAlert.count({ where: { isAcknowledged: false } }),
        db.ioTSensor.aggregate({ where: { isActive: true, battery: { not: null } }, _avg: { battery: true } }),
        db.ioTSensor.aggregate({ where: { isActive: true, signal: { not: null } }, _avg: { signal: true } }),
        db.ioTSensor.groupBy({
          by: ['siteId'],
          where: { isActive: true },
          _count: { id: true },
        }),
      ]);

      // Get site details for the summary
      const siteIds = sitesWithSensors.map(s => s.siteId);
      const sites = await db.site.findMany({
        where: { id: { in: siteIds } },
        select: { id: true, name: true },
      });

      // Get per-site status counts
      const sitesSummary = await Promise.all(
        sites.map(async (site) => {
          const [total, online, warning, critical] = await Promise.all([
            db.ioTSensor.count({ where: { siteId: site.id, isActive: true } }),
            db.ioTSensor.count({ where: { siteId: site.id, isActive: true, status: 'online' } }),
            db.ioTSensor.count({ where: { siteId: site.id, isActive: true, status: 'warning' } }),
            db.ioTSensor.count({ where: { siteId: site.id, isActive: true, status: 'critical' } }),
          ]);
          return { site: site.name, total, online, warning, critical };
        })
      );

      const dashboard = {
        totalSensors,
        onlineSensors,
        warningSensors,
        criticalSensors,
        offlineSensors,
        activeAlerts,
        unacknowledgedAlerts,
        averageBattery: Math.round(avgBattery._avg.battery ?? 0),
        averageSignal: Math.round(avgSignal._avg.signal ?? 0),
        lastUpdate: new Date().toISOString(),
        sitesSummary,
      };

      return Response.json(dashboard);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
