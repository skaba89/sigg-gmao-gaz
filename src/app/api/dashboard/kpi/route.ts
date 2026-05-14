import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const metric = searchParams.get('metric');
    const period = searchParams.get('period');

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (metric) where.metric = metric;
    if (period) where.period = period;

    const kpiRecords = await db.kPIRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      include: { site: { select: { name: true, code: true } } },
    });

    return Response.json({ data: kpiRecords });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
