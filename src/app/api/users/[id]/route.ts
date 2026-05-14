import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.siteId !== undefined) updateData.siteId = body.siteId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.password) {
      updateData.password = await hashPassword(body.password);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        site: { select: { name: true, code: true } },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Email déjà utilisé' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
