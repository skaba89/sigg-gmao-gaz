import { NextResponse } from 'next/server';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { sensorId } = await context.params;
      const { searchParams } = new URL(request.url);
      const minutes = parseInt(searchParams.get('minutes') || '30');
      const points = Math.min(minutes, 60);

      // Generate simulated reading history
      const readings: { timestamp: string; value: number; status: string }[] = [];
      const now = Date.now();
      for (let i = points; i >= 0; i--) {
        readings.push({
          timestamp: new Date(now - i * 60000).toISOString(),
          value: Math.round((50 + Math.random() * 30 + Math.sin(i / 5) * 10) * 100) / 100,
          status: Math.random() > 0.9 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'normal',
        });
      }

      return NextResponse.json({ sensorId, readings });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
