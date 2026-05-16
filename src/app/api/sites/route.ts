import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createSiteSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get('isActive');
      const type = searchParams.get('type');

      const where: any = {};
      if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';
      if (type) where.type = type;

      const sites = await db.site.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              equipment: true,
              workOrders: true,
              incidents: true,
              users: true,
              warehouses: true,
            },
          },
        },
      });

      return Response.json({ data: sites });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createSiteSchema, body);

      const site = await db.site.create({
        data: {
          name: data.name,
          code: data.code,
          address: data.address,
          city: data.city,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          type: data.type,
          isActive: data.isActive,
        },
      });

      return Response.json(site, { status: 201 });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code site déjà existant' }, { status: 409 });
      }
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE'] }
);
