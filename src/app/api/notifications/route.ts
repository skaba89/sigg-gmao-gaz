import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    const where: any = { userId: authUser.userId };
    if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { userId: authUser.userId, isRead: false },
    });

    return Response.json({ data: notifications, unreadCount });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
