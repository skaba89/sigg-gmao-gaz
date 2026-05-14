import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sensorId: string }> }
) {
  try {
    const { sensorId } = await params;
    const { searchParams } = new URL(request.url);
    const minutes = parseInt(searchParams.get('minutes') || '30');
    const points = Math.min(minutes, 60);

    // Generate simulated reading history
    const readings = [];
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
}
