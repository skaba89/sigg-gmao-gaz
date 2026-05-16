import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createWarehouseSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const siteId = searchParams.get('siteId');

      const where: any = { deletedAt: null };
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
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createWarehouseSchema, body);

      const warehouse = await db.warehouse.create({
        data: {
          name: data.name,
          code: data.code,
          siteId: data.siteId,
          type: data.type || 'SECONDAIRE',
          address: data.address,
          managerId: data.managerId,
          isActive: data.isActive ?? true,
        },
        include: {
          site: { select: { name: true, code: true, city: true } },
          manager: { select: { id: true, name: true } },
        },
      });

      return Response.json(warehouse, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code entrepôt déjà existant' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);
