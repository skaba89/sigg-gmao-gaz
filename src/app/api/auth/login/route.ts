import { db } from '@/lib/db';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth-utils';
import { loginSchema, validateOrThrow } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = validateOrThrow(loginSchema, body);

    const user = await db.user.findUnique({
      where: { email: data.email },
      include: { site: true },
    });

    if (!user) {
      return Response.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    // Check soft delete
    if (user.deletedAt) {
      return Response.json({ error: 'Compte supprimé' }, { status: 401 });
    }

    const isValid = await verifyPassword(data.password, user.password);
    if (!isValid) {
      return Response.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ error: 'Compte désactivé' }, { status: 403 });
    }

    // Update last login
    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role as any });

    const { password: _, deletedAt: __, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    if (error.message?.startsWith('Validation:')) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
