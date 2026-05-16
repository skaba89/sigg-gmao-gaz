import { db } from '@/lib/db';
import { hashPassword, generateToken, withAuth, type TokenPayload } from '@/lib/auth-utils';
import { registerSchema, validateOrThrow } from '@/lib/validations';

export const POST = withAuth(
  async (request: Request, _context, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(registerSchema, body);

      const existingUser = await db.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return Response.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(data.password);

      const newUser = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: data.role,
          phone: data.phone,
          department: data.department,
          siteId: data.siteId,
        },
        include: { site: true },
      });

      const token = generateToken({ userId: newUser.id, email: newUser.email, role: newUser.role as any });

      const { password: _, deletedAt: __, ...userWithoutPassword } = newUser;

      return Response.json({ user: userWithoutPassword, token }, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Email déjà utilisé' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE'] }
);
