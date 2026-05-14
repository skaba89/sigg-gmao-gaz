import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      include: { site: true },
    });

    if (!user) {
      return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
