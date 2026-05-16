import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createStockMovementSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const partId = searchParams.get('partId');
      const warehouseId = searchParams.get('warehouseId');
      const type = searchParams.get('type');
      const workOrderId = searchParams.get('workOrderId');

      const where: any = { deletedAt: null };
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK', 'RESP_MAINTENANCE'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createStockMovementSchema, body);

      // Wrap the ENTIRE stock operation in a transaction for atomicity
      const movement = await db.$transaction(async (tx) => {
        // Create the movement
        const movement = await tx.stockMovement.create({
          data: {
            partId: data.partId,
            warehouseId: data.warehouseId,
            type: data.type,
            quantity: data.quantity,
            reference: data.reference,
            workOrderId: data.workOrderId,
            performedById: data.performedById,
            notes: data.notes,
          },
          include: {
            part: { select: { name: true, code: true, unit: true } },
            warehouse: { select: { name: true, code: true } },
            performedBy: { select: { name: true } },
          },
        });

        // Update part stock
        const part = await tx.part.findUnique({ where: { id: data.partId } });
        if (part) {
          let newStock = part.currentStock;
          switch (data.type) {
            case 'ENTREE':
            case 'RETOUR':
              newStock += data.quantity;
              break;
            case 'SORTIE':
              newStock = Math.max(0, newStock - data.quantity);
              break;
            case 'AJUSTEMENT':
              newStock = data.quantity; // For adjustments, quantity is the new total
              break;
            case 'TRANSFERT':
              newStock = Math.max(0, newStock - data.quantity);
              break;
          }
          await tx.part.update({ where: { id: data.partId }, data: { currentStock: newStock } });
        }

        // Update warehouse stock
        const warehouseStock = await tx.warehouseStock.findUnique({
          where: { warehouseId_partId: { warehouseId: data.warehouseId, partId: data.partId } },
        });

        if (warehouseStock) {
          let newQty = warehouseStock.quantity;
          switch (data.type) {
            case 'ENTREE':
            case 'RETOUR':
              newQty += data.quantity;
              break;
            case 'SORTIE':
              newQty = Math.max(0, newQty - data.quantity);
              break;
            case 'AJUSTEMENT':
              newQty = data.quantity;
              break;
            case 'TRANSFERT':
              newQty = Math.max(0, newQty - data.quantity);
              break;
          }
          await tx.warehouseStock.update({
            where: { id: warehouseStock.id },
            data: { quantity: newQty },
          });
        } else if (data.type === 'ENTREE' || data.type === 'RETOUR') {
          await tx.warehouseStock.create({
            data: {
              warehouseId: data.warehouseId,
              partId: data.partId,
              quantity: data.quantity,
            },
          });
        }

        return movement;
      });

      return Response.json(movement, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);
