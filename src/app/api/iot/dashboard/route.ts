import { NextResponse } from 'next/server';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      // IoT Dashboard summary
      const dashboard = {
        totalSensors: 28,
        onlineSensors: 22,
        warningSensors: 3,
        criticalSensors: 2,
        offlineSensors: 1,
        activeAlerts: 5,
        unacknowledgedAlerts: 3,
        averageBattery: 78,
        averageSignal: 85,
        lastUpdate: new Date().toISOString(),
        sitesSummary: [
          { site: 'Conakry', total: 8, online: 6, warning: 1, critical: 1 },
          { site: 'Kamsar', total: 6, online: 5, warning: 1, critical: 0 },
          { site: 'Boké', total: 5, online: 4, warning: 0, critical: 1 },
          { site: 'Nzérékoré', total: 4, online: 3, warning: 1, critical: 0 },
          { site: 'Labé', total: 3, online: 3, warning: 0, critical: 0 },
          { site: 'Kindia', total: 2, online: 1, warning: 0, critical: 0 },
        ],
      };

      return NextResponse.json(dashboard);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
