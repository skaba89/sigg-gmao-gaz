import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, updatePartSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const part = await db.part.findFirst({
        where: { id, deletedAt: null },
        include: {
          category: { select: { name: true, code: true } },
          warehouseStock: {
            include: { warehouse: { select: { name: true, code: true } } },
          },
        },
      });

      if (!part) {
        return Response.json({ error: 'Pièce non trouvée' }, { status: 404 });
      }

      return Response.json(part);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK', 'RESP_MAINTENANCE'] }
);

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const data = validateOrThrow(updatePartSchema, body);

      const existing = await db.part.findFirst({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Pièce non trouvée' }, { status: 404 });
      }

      const part = await db.part.update({
        where: { id },
        data,
        include: {
          category: { select: { name: true, code: true } },
        },
      });

      return Response.json(part);
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_STOCK'] }
);

export const DELETE = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const existing = await db.part.findFirst({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Pièce non trouvée' }, { status: 404 });
      }

      // Soft delete
      await db.part.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return Response.json({ message: 'Supprimé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
