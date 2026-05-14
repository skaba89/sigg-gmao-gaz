import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const period = searchParams.get('period'); // e.g., "2024-01" or "2024"

    const where = siteId ? { siteId } : {};

    // 1. Equipment by status (pie chart data)
    const equipmentByStatus = await db.equipment.groupBy({
      by: ['status'],
      _count: { status: true },
      where,
    });

    // 2. Equipment by criticality (donut chart data)
    const equipmentByCriticality = await db.equipment.groupBy({
      by: ['criticality'],
      _count: { criticality: true },
      where,
    });

    // 3. Work orders by month (line chart data)
    const workOrders = await db.workOrder.findMany({
      where: {
        ...where,
        createdAt: period ? {
          gte: new Date(period + "-01"),
        } : undefined,
      },
      select: { createdAt: true, status: true, type: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group work orders by month
    const workOrdersByMonth: Record<string, { total: number; byStatus: Record<string, number>; byType: Record<string, number> }> = {};
    workOrders.forEach(wo => {
      const month = wo.createdAt.toISOString().substring(0, 7);
      if (!workOrdersByMonth[month]) {
        workOrdersByMonth[month] = { total: 0, byStatus: {}, byType: {} };
      }
      workOrdersByMonth[month].total++;
      workOrdersByMonth[month].byStatus[wo.status] = (workOrdersByMonth[month].byStatus[wo.status] || 0) + 1;
      workOrdersByMonth[month].byType[wo.type] = (workOrdersByMonth[month].byType[wo.type] || 0) + 1;
    });

    // 4. Maintenance costs by month (bar chart data)
    const costs = await db.maintenanceCost.findMany({
      where: {
        ...where,
        date: period ? {
          gte: new Date(period + "-01"),
        } : undefined,
      },
      select: { date: true, amount: true, type: true },
      orderBy: { date: 'asc' },
    });

    const costsByMonth: Record<string, { total: number; byType: Record<string, number> }> = {};
    costs.forEach(cost => {
      const month = cost.date.toISOString().substring(0, 7);
      if (!costsByMonth[month]) {
        costsByMonth[month] = { total: 0, byType: {} };
      }
      costsByMonth[month].total += cost.amount;
      costsByMonth[month].byType[cost.type] = (costsByMonth[month].byType[cost.type] || 0) + cost.amount;
    });

    // 5. Incidents by severity over time
    const incidents = await db.incident.findMany({
      where,
      select: { detectedAt: true, severity: true, status: true },
      orderBy: { detectedAt: 'asc' },
    });

    const incidentsByMonth: Record<string, { total: number; bySeverity: Record<string, number> }> = {};
    incidents.forEach(inc => {
      const month = inc.detectedAt.toISOString().substring(0, 7);
      if (!incidentsByMonth[month]) {
        incidentsByMonth[month] = { total: 0, bySeverity: {} };
      }
      incidentsByMonth[month].total++;
      incidentsByMonth[month].bySeverity[inc.severity] = (incidentsByMonth[month].bySeverity[inc.severity] || 0) + 1;
    });

    // 6. Equipment health score distribution
    const equipmentHealth = await db.equipment.findMany({
      where,
      select: { currentHealthScore: true, name: true, code: true },
      orderBy: { currentHealthScore: 'asc' },
    });

    return Response.json({
      equipmentByStatus: equipmentByStatus.map(s => ({ status: s.status, count: s._count.status })),
      equipmentByCriticality: equipmentByCriticality.map(c => ({ criticality: c.criticality, count: c._count.criticality })),
      workOrdersByMonth,
      costsByMonth,
      incidentsByMonth,
      equipmentHealth,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
