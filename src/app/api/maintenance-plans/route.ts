import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createMaintenancePlanSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const equipmentId = searchParams.get('equipmentId');
      const type = searchParams.get('type');
      const isActive = searchParams.get('isActive');

      const where: any = {};
      if (equipmentId) where.equipmentId = equipmentId;
      if (type) where.type = type;
      if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';

      const [data, total] = await Promise.all([
        db.maintenancePlan.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { nextDueDate: 'asc' },
          include: {
            equipment: { select: { name: true, code: true, criticality: true, status: true, site: { select: { name: true } } } },
            tasks: { orderBy: { order: 'asc' } },
          },
        }),
        db.maintenancePlan.count({ where }),
      ]);

      return Response.json({ data, total, page, pageSize });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);

export const POST = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const body = await request.json();
      const data = validateOrThrow(createMaintenancePlanSchema, body);

      // Generate code
      const count = await db.maintenancePlan.count();
      const code = `MP-${String(count + 1).padStart(5, '0')}`;

      const plan = await db.maintenancePlan.create({
        data: {
          code,
          name: data.name,
          equipmentId: data.equipmentId,
          type: data.type || 'PERIODIQUE',
          frequency: data.frequency || 'MOIS',
          frequencyValue: data.frequencyValue || 1,
          nextDueDate: new Date(data.nextDueDate),
          isActive: data.isActive ?? true,
          description: data.description,
          estimatedDuration: data.estimatedDuration,
          tasks: body.tasks ? {
            create: body.tasks.map((task: any, index: number) => ({
              description: task.description,
              order: task.order ?? index,
              isRequired: task.isRequired ?? true,
              estimatedMinutes: task.estimatedMinutes,
            })),
          } : undefined,
        },
        include: {
          equipment: { select: { name: true, code: true } },
          tasks: { orderBy: { order: 'asc' } },
        },
      });

      return Response.json(plan, { status: 201 });
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code plan de maintenance déjà existant' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'RESP_MAINTENANCE'] }
);
