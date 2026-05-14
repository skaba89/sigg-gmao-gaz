import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';

    const suppliers = await db.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { purchaseOrders: true } },
      },
    });

    return Response.json({ data: suppliers });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
