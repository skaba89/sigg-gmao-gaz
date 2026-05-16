import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, createEquipmentSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const siteId = searchParams.get('siteId');
      const status = searchParams.get('status');
      const criticality = searchParams.get('criticality');
      const categoryId = searchParams.get('categoryId');
      const search = searchParams.get('search');

      const where: any = { deletedAt: null };
      if (siteId) where.siteId = siteId;
      if (status) where.status = status;
      if (criticality) where.criticality = criticality;
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { code: { contains: search } },
          { serialNumber: { contains: search } },
          { manufacturer: { contains: search } },
          { model: { contains: search } },
        ];
      }

      const [data, total] = await Promise.all([
        db.equipment.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            category: { select: { name: true, code: true, icon: true } },
            site: { select: { name: true, code: true, city: true } },
            zone: { select: { name: true, code: true } },
          },
        }),
        db.equipment.count({ where }),
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
      const data = validateOrThrow(createEquipmentSchema, body);

      const equipment = await db.equipment.create({
        data: {
          name: data.name,
          code: data.code,
          serialNumber: data.serialNumber,
          categoryId: data.categoryId,
          siteId: data.siteId,
          zoneId: data.zoneId,
          manufacturer: data.manufacturer,
          model: data.model,
          year: data.year,
          criticality: data.criticality,
          status: data.status,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
          installationDate: data.installationDate ? new Date(data.installationDate) : undefined,
          warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : undefined,
          expectedLifespan: data.expectedLifespan,
          currentHealthScore: data.currentHealthScore,
          qrCode: data.qrCode,
          description: data.description,
          imageUrl: data.imageUrl,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        include: {
          category: true,
          site: { select: { name: true, code: true } },
          zone: { select: { name: true, code: true } },
        },
      });

      return Response.json(equipment, { status: 201 });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Response.json({ error: 'Code équipement déjà existant' }, { status: 409 });
      }
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);
