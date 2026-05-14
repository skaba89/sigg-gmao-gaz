'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Server, ClipboardList, AlertTriangle, DollarSign, Activity, Clock,
  TrendingUp, TrendingDown, ArrowRight, AlertCircle, Wrench,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';
import { api, formatGNF, formatNumber } from '@/lib/api';

// Animated counter component
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.floor(start + (end - start) * eased);
      setCount(ref.current);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{formatNumber(count)}</>;
}

const CHART_COLORS = ['#0F766E', '#F97316', '#EA580C', '#22C55E', '#6B7280', '#8B5CF6', '#EC4899'];

const statusLabels: Record<string, string> = {
  OPERATIONNEL: 'Opérationnel',
  HORS_SERVICE: 'Hors service',
  EN_MAINTENANCE: 'En maintenance',
  EN_PANNE: 'En panne',
  MIS_AU_REBUT: 'Mis au rebut',
};

const statusColors: Record<string, string> = {
  OPERATIONNEL: '#22C55E',
  HORS_SERVICE: '#DC2626',
  EN_MAINTENANCE: '#F59E0B',
  EN_PANNE: '#EA580C',
  MIS_AU_REBUT: '#6B7280',
};

const woTypeLabels: Record<string, string> = {
  PREVENTIVE: 'Préventif',
  CORRECTIVE: 'Correctif',
  AMELIORATIVE: 'Amélioratif',
  URGENTE: 'Urgent',
};

const severityLabels: Record<string, string> = {
  CRITIQUE: 'Critique',
  MAJEURE: 'Majeure',
  MINEURE: 'Mineure',
};

const severityColors: Record<string, string> = {
  CRITIQUE: '#DC2626',
  MAJEURE: '#EA580C',
  MINEURE: '#F59E0B',
};

const woStatusLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  SUSPENDUE: 'Suspendue',
  TERMINEE: 'Terminée',
  VALIDEE: 'Validée',
  CRITIQUE: 'Critique',
};

const woStatusColors: Record<string, string> = {
  EN_ATTENTE: 'bg-slate-500',
  PLANIFIEE: 'bg-blue-500',
  EN_COURS: 'bg-primary',
  SUSPENDUE: 'bg-amber-500',
  TERMINEE: 'bg-green-500',
  VALIDEE: 'bg-emerald-600',
  CRITIQUE: 'bg-red-600',
};

const priorityColors: Record<string, string> = {
  P1_CRITIQUE: 'bg-red-600',
  P2_HAUTE: 'bg-orange-500',
  P3_MOYENNE: 'bg-yellow-500',
  P4_BASSE: 'bg-slate-400',
};

const priorityLabels: Record<string, string> = {
  P1_CRITIQUE: 'P1',
  P2_HAUTE: 'P2',
  P3_MOYENNE: 'P3',
  P4_BASSE: 'P4',
};

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getDashboardCharts(),
    ]).then(([s, c]) => {
      setStats(s);
      setCharts(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-64 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Équipements',
      value: stats?.counts?.totalEquipment || 0,
      icon: Server,
      trend: '+2',
      trendUp: true,
      glowClass: 'kpi-glow-teal',
      iconBg: 'bg-teal-600/15 dark:bg-teal-500/15',
      iconColor: 'text-teal-600 dark:text-teal-400',
    },
    {
      title: 'OT Actifs',
      value: stats?.counts?.openWorkOrders || 0,
      icon: ClipboardList,
      trend: '+3',
      trendUp: false,
      glowClass: 'kpi-glow-orange',
      iconBg: 'bg-orange-500/15',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Incidents Critiques',
      value: stats?.counts?.criticalIncidents || 0,
      icon: AlertTriangle,
      trend: '-1',
      trendUp: true,
      glowClass: 'kpi-glow-red',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Coût Maintenance',
      value: stats?.counts?.totalMaintenanceCost || 0,
      icon: DollarSign,
      trend: '+12%',
      trendUp: false,
      glowClass: '',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-600 dark:text-violet-400',
      isCurrency: true,
    },
    {
      title: 'Disponibilité',
      value: 87.5,
      icon: Activity,
      trend: '+1.2%',
      trendUp: true,
      glowClass: 'kpi-glow-green',
      iconBg: 'bg-green-500/15',
      iconColor: 'text-green-600 dark:text-green-400',
      isPercent: true,
    },
    {
      title: 'MTTR',
      value: 4.5,
      icon: Clock,
      trend: '-0.3h',
      trendUp: true,
      glowClass: '',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-600 dark:text-blue-400',
      suffix: 'h',
    },
  ];

  // Prepare chart data
  const eqStatusData = (stats?.equipmentByStatus || []).map((s: any) => ({
    name: statusLabels[s.status] || s.status,
    value: s.count,
    color: statusColors[s.status] || '#6B7280',
  }));

  const woTypeData = (stats?.workOrdersByType || []).map((t: any) => ({
    name: woTypeLabels[t.type] || t.type,
    value: t.count,
  }));

  const incSeverityData = (stats?.incidentsBySeverity || []).map((s: any) => ({
    name: severityLabels[s.severity] || s.severity,
    value: s.count,
    color: severityColors[s.severity] || '#6B7280',
  }));

  // Cost trend from charts data
  const costTrendData = Object.entries(charts?.costsByMonth || {}).map(([month, data]: [string, any]) => ({
    month,
    total: data.total,
    ...data.byType,
  }));

  const eqHealthData = (charts?.equipmentHealth || []).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`relative overflow-hidden ${kpi.glowClass}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${
                    kpi.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                  }`}>
                    {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.trend}
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  {kpi.isCurrency ? (
                    <span className="text-lg">{formatGNF(kpi.value)}</span>
                  ) : kpi.isPercent ? (
                    <>{kpi.value}%</>
                  ) : (
                    <>
                      <AnimatedCounter value={kpi.value} />
                      {kpi.suffix && <span className="text-base font-normal text-muted-foreground ml-0.5">{kpi.suffix}</span>}
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Equipment by Status - Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Équipements par Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eqStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {eqStatusData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {eqStatusData.map((entry: any) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Work Orders by Type - Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">OT par Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={woTypeData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {woTypeData.map((_: any, index: number) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Incidents by Severity - Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Incidents par Sévérité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incSeverityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }: any) => `${name}: ${value}`}
                    >
                      {incSeverityData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Trend - Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tendance Coûts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => formatGNF(value)}
                    />
                    <Area type="monotone" dataKey="total" stroke="#0F766E" fill="#0F766E" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Work Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Ordres de Travail Récents</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary h-7">
                  Voir tout <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {(stats?.recentWorkOrders || []).map((wo: any) => (
                <div key={wo.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-1.5 h-8 rounded-full ${woStatusColors[wo.status] || 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{wo.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{wo.code}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${woStatusColors[wo.status]} text-white border-0`}>
                        {woStatusLabels[wo.status] || wo.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-[10px] px-1.5 py-0 h-4 ${priorityColors[wo.priority] || 'bg-slate-400'} text-white border-0`}>
                      {priorityLabels[wo.priority] || wo.priority}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!stats?.recentWorkOrders || stats.recentWorkOrders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun ordre de travail</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Critical Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Alertes Critiques</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-500 animate-pulse-critical" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {(stats?.recentIncidents || []).filter((inc: any) => inc.severity === 'CRITIQUE' || inc.status === 'OUVERT' || inc.status === 'EN_COURS').map((inc: any) => (
                <div key={inc.id} className="flex items-start gap-3 p-2 rounded-lg bg-red-500/5 dark:bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${inc.severity === 'CRITIQUE' ? 'text-red-500 animate-pulse-critical' : 'text-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.equipment?.name || 'N/A'}</p>
                  </div>
                  <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 text-white ${
                    inc.severity === 'CRITIQUE' ? 'bg-red-600' : inc.severity === 'MAJEURE' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {severityLabels[inc.severity] || inc.severity}
                  </Badge>
                </div>
              ))}
              {stats?.counts?.overduePlans > 0 && (
                <div className="flex items-start gap-3 p-2 rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Plans en retard</p>
                    <p className="text-xs text-muted-foreground">{stats.counts.overduePlans} plan(s) de maintenance échus</p>
                  </div>
                </div>
              )}
              {stats?.counts?.lowStockParts > 0 && (
                <div className="flex items-start gap-3 p-2 rounded-lg bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20">
                  <Wrench className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Stock faible</p>
                    <p className="text-xs text-muted-foreground">{stats.counts.lowStockParts} pièce(s) sous le seuil minimum</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Equipment Health Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Santé Équipements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-72 overflow-y-auto">
              {eqHealthData.map((eq: any) => (
                <div key={eq.code} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate max-w-[60%]">{eq.name}</span>
                    <span className={`text-xs font-bold ${
                      eq.currentHealthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                      eq.currentHealthScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {eq.currentHealthScore}%
                    </span>
                  </div>
                  <Progress
                    value={eq.currentHealthScore}
                    className={`h-1.5 ${
                      eq.currentHealthScore >= 80 ? '[&>div]:bg-green-500' :
                      eq.currentHealthScore >= 50 ? '[&>div]:bg-amber-500' :
                      '[&>div]:bg-red-500'
                    }`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
