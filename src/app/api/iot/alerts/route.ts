import { NextResponse } from 'next/server';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      // Simulated alerts
      const alerts = [
        {
          id: 'alert-001',
          sensorId: 'EQ-001-TEMPERATURE',
          sensorName: 'Température - Compresseur Atlas',
          type: 'critical',
          message: 'Température critique: 105°C (seuil: 100°C)',
          value: 105,
          threshold: 100,
          unit: '°C',
          site: 'Conakry',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          acknowledged: false,
        },
        {
          id: 'alert-002',
          sensorId: 'EQ-002-VIBRATION',
          sensorName: 'Vibration - Turbine Siemens',
          type: 'warning',
          message: 'Vibration élevée: 9.2mm/s (seuil: 8mm/s)',
          value: 9.2,
          threshold: 8,
          unit: 'mm/s',
          site: 'Kamsar',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          acknowledged: false,
        },
        {
          id: 'alert-003',
          sensorId: 'EQ-007-PRESSURE',
          sensorName: 'Pression - Pipeline DN300',
          type: 'critical',
          message: 'Surpression détectée: 22bar (seuil: 20bar)',
          value: 22,
          threshold: 20,
          unit: 'bar',
          site: 'Boké',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          acknowledged: true,
        },
        {
          id: 'alert-004',
          sensorId: 'EQ-005-LEVEL',
          sensorName: 'Niveau - Réservoir 50m³',
          type: 'warning',
          message: 'Niveau bas: 18% (seuil: 20%)',
          value: 18,
          threshold: 20,
          unit: '%',
          site: 'Kamsar',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          acknowledged: false,
        },
      ];

      const filtered = status ? alerts.filter(a => a.type === status) : alerts;
      return NextResponse.json(filtered);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
