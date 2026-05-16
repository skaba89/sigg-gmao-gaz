import { db } from '@/lib/db';
import { withAuth, type TokenPayload, hashPassword } from '@/lib/auth-utils';
import { validateOrThrow, updateUserSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const foundUser = await db.user.findUnique({
        where: { id, deletedAt: null },
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
          updatedAt: true,
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

      if (!foundUser) {
        return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      return Response.json(foundUser);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'RESP_STOCK'], allowSelf: true }
);

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const data = validateOrThrow(updateUserSchema, body);

      const existing = await db.user.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const updateData: any = { ...data };
      if (body.password) {
        updateData.password = await hashPassword(body.password);
      } else {
        delete updateData.password;
      }

      const updatedUser = await db.user.update({
        where: { id },
        data: updateData,
        include: {
          site: { select: { name: true, code: true } },
        },
      });

      const { password: _, deletedAt: __, ...userWithoutSensitive } = updatedUser;

      return Response.json(userWithoutSensitive);
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
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE'], allowSelf: true }
);

export const DELETE = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const existing = await db.user.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      await db.user.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });

      return Response.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
