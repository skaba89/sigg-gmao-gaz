import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createUserSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const role = searchParams.get('role');
      const siteId = searchParams.get('siteId');
      const isActive = searchParams.get('isActive');

      const where: any = { deletedAt: null };
      if (role) where.role = role;
      if (siteId) where.siteId = siteId;
      if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';

      const users = await db.user.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          department: true,
          siteId: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          site: { select: { name: true, code: true } },
          _count: {
            select: {
              assignedWorkOrders: true,
              reportedIncidents: true,
              auditLogs: true,
            },
          },
        },
      });

      return Response.json({ data: users });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'RESP_STOCK'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createUserSchema, body);

      const { hashPassword } = await import('@/lib/auth-utils');
      const hashedPassword = await hashPassword(data.password);

      const createdUser = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: data.role,
          phone: data.phone,
          department: data.department,
          siteId: data.siteId,
          isActive: data.isActive,
        },
        include: {
          site: { select: { name: true, code: true } },
        },
      });

      const { password: _, deletedAt: __, ...userWithoutSensitive } = createdUser;

      return Response.json(userWithoutSensitive, { status: 201 });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Response.json({ error: 'Email déjà utilisé' }, { status: 409 });
      }
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE'] }
);
