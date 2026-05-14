import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const partId = searchParams.get('partId');
    const warehouseId = searchParams.get('warehouseId');
    const type = searchParams.get('type');
    const workOrderId = searchParams.get('workOrderId');

    const where: any = {};
    if (partId) where.partId = partId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (type) where.type = type;
    if (workOrderId) where.workOrderId = workOrderId;

    const [data, total] = await Promise.all([
      db.stockMovement.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          part: { select: { name: true, code: true, unit: true } },
          warehouse: { select: { name: true, code: true } },
          workOrder: { select: { code: true, title: true } },
          performedBy: { select: { id: true, name: true } },
        },
      }),
      db.stockMovement.count({ where }),
    ]);

    return Response.json({ data, total, page, pageSize });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.partId || !body.warehouseId || !body.type || !body.quantity || !body.performedById) {
      return Response.json({ error: 'Pièce, entrepôt, type, quantité et opérateur requis' }, { status: 400 });
    }

    // Create the movement
    const movement = await db.stockMovement.create({
      data: {
        partId: body.partId,
        warehouseId: body.warehouseId,
        type: body.type,
        quantity: body.quantity,
        reference: body.reference,
        workOrderId: body.workOrderId,
        performedById: body.performedById,
        notes: body.notes,
      },
      include: {
        part: { select: { name: true, code: true, unit: true } },
        warehouse: { select: { name: true, code: true } },
        performedBy: { select: { name: true } },
      },
    });

    // Update part stock
    const part = await db.part.findUnique({ where: { id: body.partId } });
    if (part) {
      let newStock = part.currentStock;
      switch (body.type) {
        case 'ENTREE':
        case 'RETOUR':
          newStock += body.quantity;
          break;
        case 'SORTIE':
          newStock = Math.max(0, newStock - body.quantity);
          break;
        case 'AJUSTEMENT':
          newStock = body.quantity; // For adjustments, quantity is the new total
          break;
        case 'TRANSFERT':
          newStock = Math.max(0, newStock - body.quantity);
          break;
      }
      await db.part.update({ where: { id: body.partId }, data: { currentStock: newStock } });
    }

    // Update warehouse stock
    const warehouseStock = await db.warehouseStock.findUnique({
      where: { warehouseId_partId: { warehouseId: body.warehouseId, partId: body.partId } },
    });

    if (warehouseStock) {
      let newQty = warehouseStock.quantity;
      switch (body.type) {
        case 'ENTREE':
        case 'RETOUR':
          newQty += body.quantity;
          break;
        case 'SORTIE':
          newQty = Math.max(0, newQty - body.quantity);
          break;
        case 'AJUSTEMENT':
          newQty = body.quantity;
          break;
        case 'TRANSFERT':
          newQty = Math.max(0, newQty - body.quantity);
          break;
      }
      await db.warehouseStock.update({
        where: { id: warehouseStock.id },
        data: { quantity: newQty },
      });
    } else if (body.type === 'ENTREE' || body.type === 'RETOUR') {
      await db.warehouseStock.create({
        data: {
          warehouseId: body.warehouseId,
          partId: body.partId,
          quantity: body.quantity,
        },
      });
    }

    return Response.json(movement, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
