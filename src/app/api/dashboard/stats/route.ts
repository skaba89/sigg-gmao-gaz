import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const siteId = searchParams.get('siteId');

      const whereClause = siteId ? { siteId } : {};

      // Equipment counts by status
      const equipmentByStatus = await db.equipment.groupBy({
        by: ['status'],
        _count: { status: true },
        where: siteId ? { siteId } : {},
      });

      // Work order counts by status
      const workOrdersByStatus = await db.workOrder.groupBy({
        by: ['status'],
        _count: { status: true },
        where: siteId ? { siteId } : {},
      });

      // Work order counts by type
      const workOrdersByType = await db.workOrder.groupBy({
        by: ['type'],
        _count: { type: true },
        where: siteId ? { siteId } : {},
      });

      // Incident counts by severity
      const incidentsBySeverity = await db.incident.groupBy({
        by: ['severity'],
        _count: { severity: true },
        where: siteId ? { siteId } : {},
      });

      // Incident counts by status
      const incidentsByStatus = await db.incident.groupBy({
        by: ['status'],
        _count: { status: true },
        where: siteId ? { siteId } : {},
      });

      // Total counts
      const [
        totalEquipment,
        totalWorkOrders,
        totalIncidents,
        totalSites,
        totalUsers,
        activeMaintenancePlans,
        openWorkOrders,
        criticalIncidents,
        _lowStockPartsPlaceholder,
      ] = await Promise.all([
        db.equipment.count({ where: siteId ? { siteId } : {} }),
        db.workOrder.count({ where: siteId ? { siteId } : {} }),
        db.incident.count({ where: siteId ? { siteId } : {} }),
        db.site.count(),
        db.user.count({ where: { isActive: true } }),
        db.maintenancePlan.count({ where: { isActive: true } }),
        db.workOrder.count({ where: { status: { in: ['EN_ATTENTE', 'EN_COURS', 'CRITIQUE'] } } }),
        db.incident.count({ where: { severity: 'CRITIQUE', status: { in: ['OUVERT', 'EN_COURS'] } } }),
        Promise.resolve(0), // placeholder for lowStockParts
      ]);

      // Low stock parts - fetch and filter in JS since Prisma can't compare two columns
      const allParts = await db.part.findMany({
        where: { isActive: true, deletedAt: null },
        select: { currentStock: true, minStockLevel: true },
      });
      const lowStockParts = allParts.filter(p => p.currentStock <= p.minStockLevel).length;

      // Equipment by criticality
      const equipmentByCriticality = await db.equipment.groupBy({
        by: ['criticality'],
        _count: { criticality: true },
        where: siteId ? { siteId } : {},
      });

      // Financial totals
      const maintenanceCosts = await db.maintenanceCost.aggregate({
        _sum: { amount: true },
        where: siteId ? { siteId } : {},
      });

      // Recent work orders
      const recentWorkOrders = await db.workOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: siteId ? { siteId } : {},
        include: {
          equipment: { select: { name: true, code: true } },
          assignedTo: { select: { name: true } },
        },
      });

      // Recent incidents
      const recentIncidents = await db.incident.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: siteId ? { siteId } : {},
        include: {
          equipment: { select: { name: true, code: true } },
          reportedBy: { select: { name: true } },
        },
      });

      // Overdue maintenance plans
      const overduePlans = await db.maintenancePlan.count({
        where: {
          isActive: true,
          nextDueDate: { lt: new Date() },
          ...(siteId ? { equipment: { siteId } } : {}),
        },
      });

      return Response.json({
        counts: {
          totalEquipment,
          totalWorkOrders,
          totalIncidents,
          totalSites,
          totalUsers,
          activeMaintenancePlans,
          openWorkOrders,
          criticalIncidents,
          lowStockParts,
          overduePlans,
          totalMaintenanceCost: maintenanceCosts._sum.amount || 0,
        },
        equipmentByStatus: equipmentByStatus.map(s => ({ status: s.status, count: s._count.status })),
        equipmentByCriticality: equipmentByCriticality.map(c => ({ criticality: c.criticality, count: c._count.criticality })),
        workOrdersByStatus: workOrdersByStatus.map(s => ({ status: s.status, count: s._count.status })),
        workOrdersByType: workOrdersByType.map(t => ({ type: t.type, count: t._count.type })),
        incidentsBySeverity: incidentsBySeverity.map(s => ({ severity: s.severity, count: s._count.severity })),
        incidentsByStatus: incidentsByStatus.map(s => ({ status: s.status, count: s._count.status })),
        recentWorkOrders,
        recentIncidents,
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  // No role restriction - all authenticated users
);
