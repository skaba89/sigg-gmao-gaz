import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const isRead = searchParams.get('isRead');
      const type = searchParams.get('type');

      const where: any = { userId: user.userId };
      if (isRead !== null && isRead !== undefined) where.isRead = isRead === 'true';
      if (type) where.type = type;

      const notifications = await db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const unreadCount = await db.notification.count({
        where: { userId: user.userId, isRead: false },
      });

      return Response.json({ data: notifications, unreadCount });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  // No role restriction - all authenticated users, but filtered by user.userId
);
