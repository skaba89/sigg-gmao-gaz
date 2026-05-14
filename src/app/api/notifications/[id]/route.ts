import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) {
      return Response.json({ error: 'Notification non trouvée' }, { status: 404 });
    }

    if (notification.userId !== authUser.userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 403 });
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
