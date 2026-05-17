import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createPurchaseOrderSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const status = searchParams.get('status');
      const supplierId = searchParams.get('supplierId');

      const where: any = { deletedAt: null };
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK', 'FINANCE'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createPurchaseOrderSchema, body);

      // Calculate total
      const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      // Use transaction for atomicity: create PO + items together
      const purchaseOrder = await db.$transaction(async (tx) => {
        // Generate code inside transaction to avoid race conditions
        const count = await tx.purchaseOrder.count();
        const code = `PO-${String(count + 1).padStart(5, '0')}`;

        return tx.purchaseOrder.create({
          data: {
            code,
            supplierId: data.supplierId,
            status: 'BROUILLON',
            totalAmount,
            currency: 'GNF',
            requestedById: user.userId,
            expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
            notes: data.notes,
            items: {
              create: data.items.map((item) => ({
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
      });

      return Response.json(purchaseOrder, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code bon de commande déjà existant' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);
