import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';
import { validateOrThrow, updateEquipmentSchema } from '@/lib/validations';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const equipment = await db.equipment.findUnique({
        where: { id, deletedAt: null },
        include: {
          category: true,
          site: { select: { name: true, code: true, city: true, address: true } },
          zone: { select: { name: true, code: true, building: { select: { name: true } } } },
          documents: true,
          parameters: true,
          workOrders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              assignedTo: { select: { name: true } },
            },
          },
          incidents: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              reportedBy: { select: { name: true } },
            },
          },
          maintenancePlans: {
            where: { isActive: true },
            include: { tasks: true },
          },
          maintenanceCosts: {
            take: 10,
            orderBy: { date: 'desc' },
          },
        },
      });

      if (!equipment) {
        return Response.json({ error: 'Équipement non trouvé' }, { status: 404 });
      }

      return Response.json(equipment);
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE', 'TECHNICIEN'] }
);

export const PUT = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const data = validateOrThrow(updateEquipmentSchema, body);

      const existing = await db.equipment.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Équipement non trouvé' }, { status: 404 });
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.code !== undefined) updateData.code = data.code;
      if (data.serialNumber !== undefined) updateData.serialNumber = data.serialNumber;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.siteId !== undefined) updateData.siteId = data.siteId;
      if (data.zoneId !== undefined) updateData.zoneId = data.zoneId;
      if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
      if (data.model !== undefined) updateData.model = data.model;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.criticality !== undefined) updateData.criticality = data.criticality;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
      if (data.installationDate !== undefined) updateData.installationDate = data.installationDate ? new Date(data.installationDate) : null;
      if (data.warrantyEnd !== undefined) updateData.warrantyEnd = data.warrantyEnd ? new Date(data.warrantyEnd) : null;
      if (data.expectedLifespan !== undefined) updateData.expectedLifespan = data.expectedLifespan;
      if (data.currentHealthScore !== undefined) updateData.currentHealthScore = data.currentHealthScore;
      if (data.qrCode !== undefined) updateData.qrCode = data.qrCode;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;

      const equipment = await db.equipment.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          site: { select: { name: true, code: true } },
          zone: { select: { name: true, code: true } },
        },
      });

      return Response.json(equipment);
    } catch (error: any) {
      if (error.message?.startsWith('Validation:')) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'RESP_MAINTENANCE'] }
);

export const DELETE = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { id } = await context.params;

      const existing = await db.equipment.findUnique({ where: { id, deletedAt: null } });
      if (!existing) {
        return Response.json({ error: 'Équipement non trouvé' }, { status: 404 });
      }

      await db.equipment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return Response.json({ message: 'Équipement supprimé avec succès' });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN'] }
);
