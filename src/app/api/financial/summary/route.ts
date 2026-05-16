import { db } from '@/lib/db';
import { withAuth, type TokenPayload } from '@/lib/auth-utils';

export const GET = withAuth(
  async (request: Request, context: { params: Promise<Record<string, string>> }, user: TokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const siteId = searchParams.get('siteId');
      const period = searchParams.get('period');

      const where: any = {};
      if (siteId) where.siteId = siteId;
      if (period) where.period = period;
      if (!siteId) {
        // If no site filter, get all
      }

      // Total costs by type
      const costsByType = await db.maintenanceCost.groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { type: true },
        where,
      });

      // Total costs
      const totalCosts = await db.maintenanceCost.aggregate({
        _sum: { amount: true },
        _count: true,
        where,
      });

      // Costs by site
      const costsBySite = await db.maintenanceCost.groupBy({
        by: ['siteId'],
        _sum: { amount: true },
        where,
      });

      // Enrich with site names
      const sites = await db.site.findMany({
        select: { id: true, name: true, code: true },
      });
      const siteMap = Object.fromEntries(sites.map(s => [s.id, s]));

      const costsBySiteEnriched = costsBySite.map(cs => ({
        siteId: cs.siteId,
        site: siteMap[cs.siteId] || null,
        total: cs._sum.amount || 0,
      }));

      // Budget vs actual (from cost centers)
      const costCenterWhere: any = {};
      if (siteId) costCenterWhere.siteId = siteId;
      if (period) costCenterWhere.period = period;

      const costCenters = await db.costCenter.findMany({
        where: costCenterWhere,
        include: { site: { select: { name: true } } },
      });

      const totalBudget = costCenters.reduce((sum, cc) => sum + cc.budget, 0);
      const totalSpent = costCenters.reduce((sum, cc) => sum + cc.spent, 0);
      const totalRemaining = costCenters.reduce((sum, cc) => sum + cc.remaining, 0);

      return Response.json({
        totalCosts: totalCosts._sum.amount || 0,
        totalCostEntries: totalCosts._count,
        costsByType: costsByType.map(ct => ({
          type: ct.type,
          total: ct._sum.amount || 0,
          count: ct._count.type,
        })),
        costsBySite: costsBySiteEnriched,
        budget: {
          totalBudget,
          totalSpent,
          totalRemaining,
          utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
          costCenters,
        },
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'AUDITEUR', 'FINANCE'] }
);
