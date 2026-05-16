import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createIncidentSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const siteId = searchParams.get('siteId');
      const severity = searchParams.get('severity');
      const status = searchParams.get('status');
      const equipmentId = searchParams.get('equipmentId');
      const search = searchParams.get('search');

      const where: any = { deletedAt: null };
      if (siteId) where.siteId = siteId;
      if (severity) where.severity = severity;
      if (status) where.status = status;
      if (equipmentId) where.equipmentId = equipmentId;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { code: { contains: search } },
          { description: { contains: search } },
        ];
      }

      const [data, total] = await Promise.all([
        db.incident.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            equipment: { select: { name: true, code: true, criticality: true } },
            site: { select: { name: true, code: true } },
            reportedBy: { select: { id: true, name: true, role: true } },
            workOrder: { select: { code: true, title: true, status: true } },
          },
        }),
        db.incident.count({ where }),
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
      const data = validateOrThrow(createIncidentSchema, body);

      // Use authenticated user as reporter
      const reportedById = user.userId;

      // Generate code
      const count = await db.incident.count();
      const code = `INC-${String(count + 1).padStart(5, '0')}`;

      const incident = await db.incident.create({
        data: {
          code,
          title: data.title,
          description: data.description,
          equipmentId: data.equipmentId,
          siteId: data.siteId,
          reportedById,
          severity: data.severity,
          status: data.status,
          rootCause: data.rootCause,
          correctiveAction: data.correctiveAction,
          workOrderId: data.workOrderId,
        },
        include: {
          equipment: { select: { name: true, code: true } },
          site: { select: { name: true, code: true } },
          reportedBy: { select: { name: true } },
          workOrder: { select: { code: true, title: true } },
        },
      });

      return Response.json(incident, { status: 201 });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code incident déjà existant' }, { status: 409 });
      }
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'TECHNICIEN'] }
);
