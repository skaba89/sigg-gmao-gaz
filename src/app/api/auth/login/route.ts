import { db } from '@/lib/db';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email }, include: { site: true } });

    if (!user) {
      return Response.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return Response.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ error: 'Compte désactivé' }, { status: 403 });
    }

    // Update last login
    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
