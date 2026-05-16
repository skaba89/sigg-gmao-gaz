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

      const costCenters = await db.costCenter.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          site: { select: { name: true, code: true } },
        },
      });

      return Response.json({ data: costCenters });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
  { roles: ['SUPER_ADMIN', 'DIRECTION_GENERALE', 'AUDITEUR', 'FINANCE'] }
);
