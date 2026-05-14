import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const equipment = await db.equipment.findUnique({
      where: { id },
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
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.equipment.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Équipement non trouvé' }, { status: 404 });
    }

    const equipment = await db.equipment.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.serialNumber !== undefined && { serialNumber: body.serialNumber }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.siteId !== undefined && { siteId: body.siteId }),
        ...(body.zoneId !== undefined && { zoneId: body.zoneId }),
        ...(body.manufacturer !== undefined && { manufacturer: body.manufacturer }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.criticality !== undefined && { criticality: body.criticality }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.purchaseDate !== undefined && { purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null }),
        ...(body.installationDate !== undefined && { installationDate: body.installationDate ? new Date(body.installationDate) : null }),
        ...(body.warrantyEnd !== undefined && { warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : null }),
        ...(body.expectedLifespan !== undefined && { expectedLifespan: body.expectedLifespan }),
        ...(body.currentHealthScore !== undefined && { currentHealthScore: body.currentHealthScore }),
        ...(body.qrCode !== undefined && { qrCode: body.qrCode }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
      },
      include: {
        category: true,
        site: { select: { name: true, code: true } },
        zone: { select: { name: true, code: true } },
      },
    });

    return Response.json(equipment);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await db.equipment.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Équipement non trouvé' }, { status: 404 });
    }

    await db.equipment.delete({ where: { id } });

    return Response.json({ message: 'Équipement supprimé avec succès' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
