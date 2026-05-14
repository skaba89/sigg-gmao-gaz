import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.part.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: 'Pièce non trouvée' }, { status: 404 });
    }

    const part = await db.part.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.manufacturer !== undefined && { manufacturer: body.manufacturer }),
        ...(body.partNumber !== undefined && { partNumber: body.partNumber }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.unitPrice !== undefined && { unitPrice: body.unitPrice }),
        ...(body.minStockLevel !== undefined && { minStockLevel: body.minStockLevel }),
        ...(body.maxStockLevel !== undefined && { maxStockLevel: body.maxStockLevel }),
        ...(body.currentStock !== undefined && { currentStock: body.currentStock }),
        ...(body.reorderPoint !== undefined && { reorderPoint: body.reorderPoint }),
        ...(body.leadTimeDays !== undefined && { leadTimeDays: body.leadTimeDays }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.specifications !== undefined && { specifications: body.specifications }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        category: { select: { name: true, code: true } },
      },
    });

    return Response.json(part);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
