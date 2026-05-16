import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const notification = await db.notification.findUnique({ where: { id } });
      if (!notification) {
        return Response.json({ error: 'Notification non trouvée' }, { status: 404 });
      }

      // Verify ownership: users can only update their own notifications
      if (notification.userId !== user.userId) {
        return Response.json({ error: 'Accès refusé. Cette notification ne vous appartient pas.' }, { status: 403 });
      }

      const updated = await db.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return Response.json(updated);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  // No role restriction - all authenticated users, but ownership verified
);

export const DELETE = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const notification = await db.notification.findUnique({ where: { id } });
      if (!notification) {
        return Response.json({ error: 'Notification non trouvée' }, { status: 404 });
      }

      // Only SUPER_ADMIN or the notification owner can delete
      if (user.role !== 'SUPER_ADMIN' && notification.userId !== user.userId) {
        return Response.json({ error: 'Accès refusé. Permissions insuffisantes.' }, { status: 403 });
      }

      await db.notification.delete({ where: { id } });

      return Response.json({ message: 'Notification supprimée avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  // No role restriction - ownership verified in handler
);
