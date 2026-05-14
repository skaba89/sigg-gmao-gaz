import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    const where: any = {};
    if (siteId) where.siteId = siteId;

    const warehouses = await db.warehouse.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        site: { select: { name: true, code: true, city: true } },
        manager: { select: { id: true, name: true } },
        stocks: {
          include: { part: { select: { name: true, code: true, unit: true } } },
        },
      },
    });

    return Response.json({ data: warehouses });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
