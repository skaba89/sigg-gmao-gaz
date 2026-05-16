import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createSupplierSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get('isActive');

      const where: any = { deletedAt: null };
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createSupplierSchema, body);

      const supplier = await db.supplier.create({
        data: {
          name: data.name,
          code: data.code,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country || 'Guinée',
          isActive: data.isActive ?? true,
          rating: data.rating,
        },
      });

      return Response.json(supplier, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code fournisseur déjà existant' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);
