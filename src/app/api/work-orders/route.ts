import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createWorkOrderSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const siteId = searchParams.get('siteId');
      const status = searchParams.get('status');
      const type = searchParams.get('type');
      const priority = searchParams.get('priority');
      const assignedToId = searchParams.get('assignedToId');
      const equipmentId = searchParams.get('equipmentId');
      const search = searchParams.get('search');

      const where: any = { deletedAt: null };
      if (siteId) where.siteId = siteId;
      if (status) where.status = status;
      if (type) where.type = type;
      if (priority) where.priority = priority;
      if (assignedToId) where.assignedToId = assignedToId;
      if (equipmentId) where.equipmentId = equipmentId;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { code: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const [data, total] = await Promise.all([
        db.workOrder.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            equipment: { select: { name: true, code: true, criticality: true } },
            site: { select: { name: true, code: true } },
            assignedTo: { select: { id: true, name: true, role: true } },
            requestedBy: { select: { id: true, name: true } },
            supervisor: { select: { id: true, name: true } },
            parts: { include: { part: { select: { name: true, code: true, unit: true } } } },
            checklists: true,
            comments: {
              take: 3,
              orderBy: { createdAt: 'desc' },
              include: { user: { select: { name: true } } },
            },
          },
        }),
        db.workOrder.count({ where }),
      ]);

      return Response.json({ data, total, page, pageSize });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'TECHNICIEN'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createWorkOrderSchema, body);

      // Generate code
      const count = await db.workOrder.count();
      const code = `OT-${String(count + 1).padStart(5, '0')}`;

      // Use user.userId as requestedById if not provided
      const requestedById = data.requestedById || user.userId;

      const workOrder = await db.workOrder.create({
        data: {
          code,
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          priority: data.priority,
          equipmentId: data.equipmentId,
          siteId: data.siteId,
          assignedToId: data.assignedToId,
          requestedById,
          supervisorId: data.supervisorId,
          plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
          plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
          estimatedHours: data.estimatedHours,
          notes: data.notes,
        },
        include: {
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
          assignedTo: { select: { name: true } },
          requestedBy: { select: { name: true } },
          supervisor: { select: { name: true } },
        },
      });

      return Response.json(workOrder, { status: 201 });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code ordre de travail déjà existant' }, { status: 409 });
      }
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
