import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, _context, user: TokenPayload) => {
    try {
      const dbUser = await db.user.findUnique({
        where: { id: user.userId },
        include: { site: true },
      });

      if (!dbUser || dbUser.deletedAt) {
        return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }

      const { password: _, deletedAt: __, ...userWithoutPassword } = dbUser;

      return Response.json({ user: userWithoutPassword });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
);
