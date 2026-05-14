import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');

    const where: any = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const [data, total] = await Promise.all([
      db.purchaseOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { name: true, code: true, contactName: true } },
          requestedBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
          items: {
            include: { part: { select: { name: true, code: true, unit: true } } },
          },
        },
      }),
      db.purchaseOrder.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.supplierId || !body.requestedById || !body.items?.length) {
      return Response.json({ error: 'Fournisseur, demandeur et articles requis' }, { status: 400 });
    }

    // Generate code
    const count = await db.purchaseOrder.count();
    const code = `PO-${String(count + 1).padStart(5, '0')}`;

    // Calculate total
    const totalAmount = body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        code,
        supplierId: body.supplierId,
        status: body.status || 'BROUILLON',
        totalAmount,
        currency: body.currency || 'GNF',
        requestedById: body.requestedById,
        approvedById: body.approvedById,
        expectedDeliveryDate: body.expectedDeliveryDate ? new Date(body.expectedDeliveryDate) : undefined,
        notes: body.notes,
        items: {
          create: body.items.map((item: any) => ({
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            receivedQuantity: 0,
          })),
        },
      },
      include: {
        supplier: { select: { name: true, code: true } },
        requestedBy: { select: { name: true } },
        items: {
          include: { part: { select: { name: true, code: true, unit: true } } },
        },
      },
    });

    return Response.json(purchaseOrder, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Code bon de commande déjà existant' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
