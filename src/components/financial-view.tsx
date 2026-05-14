'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, PieChart as PieIcon,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend,
} from 'recharts';
import { api, formatGNF, formatDate } from '@/lib/api';

const CHART_COLORS = ['#0F766E', '#F97316', '#EA580C', '#22C55E', '#6B7280', '#8B5CF6'];

const costTypeLabels: Record<string, string> = {
  MAIN_DOEUVRE: "Main d'œuvre",
  PIECES: 'Pièces',
  OUTILLAGE: 'Outillage',
  SOUS_TRAITANCE: 'Sous-traitance',
  AUTRE: 'Autre',
};

export function FinancialView() {
  const [summary, setSummary] = useState<any>(null);
  const [costs, setCosts] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getFinancialSummary(),
      api.getCosts('?pageSize=50'),
      api.getCostCenters(),
      api.getDashboardCharts(),
    ]).then(([sumRes, costsRes, ccRes, chRes]) => {
      setSummary(sumRes);
      setCosts(costsRes.data || []);
      setCostCenters(Array.isArray(ccRes) ? ccRes : ccRes?.data || []);
      setCharts(chRes);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const totalBudget = costCenters.reduce((acc: number, cc: any) => acc + (cc.budget || 0), 0);
  const totalSpent = costCenters.reduce((acc: number, cc: any) => acc + (cc.spent || 0), 0);
  const totalRemaining = costCenters.reduce((acc: number, cc: any) => acc + (cc.remaining || 0), 0);

  // Cost by type
  const costByType: Record<string, number> = {};
  costs.forEach((c: any) => {
    costByType[c.type] = (costByType[c.type] || 0) + c.amount;
  });
  const costByTypeData = Object.entries(costByType).map(([type, amount]) => ({
    name: costTypeLabels[type] || type,
    value: amount as number,
  }));

  // Cost by site
  const costBySite: Record<string, number> = {};
  costs.forEach((c: any) => {
    const siteName = c.site?.name || 'Autre';
    costBySite[siteName] = (costBySite[siteName] || 0) + c.amount;
  });
  const costBySiteData = Object.entries(costBySite).map(([site, amount]) => ({
    name: site,
    value: amount as number,
  }));

  // Cost trend
  const costTrendData = Object.entries(charts?.costsByMonth || {}).map(([month, data]: [string, any]) => ({
    month,
    total: data.total,
    ...data.byType,
  }));

  const kpis = [
    {
      title: 'Budget Total',
      value: formatGNF(totalBudget),
      icon: Wallet,
      iconBg: 'bg-teal-600/15',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      title: 'Dépensé',
      value: formatGNF(totalSpent),
      icon: TrendingDown,
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Restant',
      value: formatGNF(totalRemaining),
      icon: TrendingUp,
      iconBg: 'bg-green-500/15',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: '% Consommé',
      value: totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}%` : '0%',
      icon: DollarSign,
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                  </div>
                </div>
                <div className="text-xl font-bold tracking-tight">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Cost by Type - Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Répartition par Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costByTypeData} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value"
                      label={({ name, value }: any) => `${name}`}
                    >
                      {costByTypeData.map((_: any, index: number) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => formatGNF(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {costByTypeData.map((entry: any, i: number) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost by Site - Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Coûts par Site</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBySiteData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => formatGNF(value)} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0F766E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Trend - Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tendance des Coûts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => formatGNF(value)} />
                    <Area type="monotone" dataKey="total" stroke="#0F766E" fill="#0F766E" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cost Entries Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Écritures de Coûts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead className="hidden md:table-cell">Site</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost: any) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{costTypeLabels[cost.type] || cost.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{cost.description || '-'}</TableCell>
                    <TableCell className="text-sm font-bold">{formatGNF(cost.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{cost.site?.name || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(cost.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Centers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Centres de Coûts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Dépensé</TableHead>
                  <TableHead>Restant</TableHead>
                  <TableHead>Consommation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenters.map((cc: any) => {
                  const pct = cc.budget > 0 ? ((cc.spent / cc.budget) * 100) : 0;
                  return (
                    <TableRow key={cc.id}>
                      <TableCell className="font-mono text-xs">{cc.code}</TableCell>
                      <TableCell className="text-sm">{cc.name}</TableCell>
                      <TableCell className="text-sm">{formatGNF(cc.budget)}</TableCell>
                      <TableCell className="text-sm font-medium">{formatGNF(cc.spent)}</TableCell>
                      <TableCell className="text-sm">{formatGNF(cc.remaining)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${pct > 80 ? 'text-red-600' : pct > 50 ? 'text-amber-600' : 'text-green-600'}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
