import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, password, name, role, phone, department, siteId } = await request.json();

    if (!email || !password || !name) {
      return Response.json({ error: 'Email, mot de passe et nom requis' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'TECHNICIEN',
        phone,
        department,
        siteId,
      },
      include: { site: true },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ user: userWithoutPassword, token }, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
