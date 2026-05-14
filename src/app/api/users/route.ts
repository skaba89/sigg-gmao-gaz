import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const siteId = searchParams.get('siteId');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (role) where.role = role;
    if (siteId) where.siteId = siteId;
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';

    const users = await db.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        siteId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        site: { select: { name: true, code: true } },
        _count: {
          select: {
            assignedWorkOrders: true,
            reportedIncidents: true,
            auditLogs: true,
          },
        },
      },
    });

    return Response.json({ data: users });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || !body.name || !body.password) {
      return Response.json({ error: 'Email, nom et mot de passe requis' }, { status: 400 });
    }

    const { hashPassword } = await import('@/lib/auth-utils');
    const hashedPassword = await hashPassword(body.password);

    const user = await db.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: body.role || 'TECHNICIEN',
        phone: body.phone,
        department: body.department,
        siteId: body.siteId,
        isActive: body.isActive ?? true,
      },
      include: {
        site: { select: { name: true, code: true } },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Email déjà utilisé' }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
