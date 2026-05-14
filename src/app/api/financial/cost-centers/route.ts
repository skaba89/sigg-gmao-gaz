import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const period = searchParams.get('period');

    const where: any = {};
    if (siteId) where.siteId = siteId;
    if (period) where.period = period;

    const costCenters = await db.costCenter.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        site: { select: { name: true, code: true } },
      },
    });

    return Response.json({ data: costCenters });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
