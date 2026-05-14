'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wifi, WifiOff, Thermometer, Gauge, Activity, Droplets,
  AlertTriangle, CheckCircle, XCircle, Bell, BellOff,
  TrendingUp, TrendingDown, Minus, RefreshCw, Settings,
  Plus, Eye, Shield, Zap, Wind, Radio, Server,
  ArrowUp, ArrowDown, Clock, MapPin, Signal,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────
interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'pressure' | 'vibration' | 'flow' | 'level' | 'gas_leak';
  unit: string;
  equipmentId: string;
  equipmentName: string;
  site: string;
  minValue: number;
  maxValue: number;
  alertLow: number;
  alertHigh: number;
  criticalLow: number;
  criticalHigh: number;
  currentValue: number;
  status: 'online' | 'offline' | 'warning' | 'critical';
  lastReading: Date;
  battery: number;
  signal: number;
}

interface SensorReading {
  timestamp: string;
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

interface IoTAlert {
  id: string;
  sensorId: string;
  sensorName: string;
  sensorType: string;
  equipmentName: string;
  site: string;
  type: 'warning' | 'critical' | 'offline' | 'recovery';
  message: string;
  value: number;
  threshold: number;
  unit: string;
  timestamp: Date;
  acknowledged: boolean;
}

// ─── Simulated Sensor Data ─────────────────────────────────────
const SITES = ['Conakry', 'Kamsar', 'Boké', 'Nzérékoré', 'Labé', 'Kindia'];

const SENSOR_TYPES: Record<Sensor['type'], { label: string; icon: React.ElementType; unit: string; color: string; typicalRange: [number, number] }> = {
  temperature: { label: 'Température', icon: Thermometer, unit: '°C', color: '#EF4444', typicalRange: [20, 120] },
  pressure:    { label: 'Pression', icon: Gauge, unit: 'bar', color: '#3B82F6', typicalRange: [1, 25] },
  vibration:   { label: 'Vibration', icon: Activity, unit: 'mm/s', color: '#F97316', typicalRange: [0.5, 15] },
  flow:        { label: 'Débit', icon: Droplets, unit: 'm³/h', color: '#06B6D4', typicalRange: [50, 500] },
  level:       { label: 'Niveau', icon: Zap, unit: '%', color: '#8B5CF6', typicalRange: [10, 100] },
  gas_leak:    { label: 'Fuite gaz', icon: Wind, unit: 'ppm', color: '#DC2626', typicalRange: [0, 50] },
};

function generateSensors(): Sensor[] {
  const equipments = [
    { id: 'EQ-001', name: 'Compresseur Atlas Copco GA90+', site: 'Conakry' },
    { id: 'EQ-002', name: 'Turbine Siemens SGT-400', site: 'Kamsar' },
    { id: 'EQ-003', name: 'Pompe centrifuge Grundfos CR 64', site: 'Conakry' },
    { id: 'EQ-004', name: 'Vanne régulation Fisher ED', site: 'Boké' },
    { id: 'EQ-005', name: 'Réservoir stockage 50m³', site: 'Kamsar' },
    { id: 'EQ-006', name: 'Compresseur Ariel JGK/4', site: 'Nzérékoré' },
    { id: 'EQ-007', name: 'Pipeline transport DN300', site: 'Boké' },
    { id: 'EQ-008', name: 'Station détente GR6', site: 'Labé' },
    { id: 'EQ-009', name: 'Groupe électrogène CAT C15', site: 'Kindia' },
    { id: 'EQ-010', name: 'Séparateur gaz-liquide', site: 'Conakry' },
  ];

  const sensorConfigs: { type: Sensor['type']; suffix: string }[] = [
    { type: 'temperature', suffix: '-TEMP' },
    { type: 'pressure', suffix: '-PRES' },
    { type: 'vibration', suffix: '-VIB' },
    { type: 'flow', suffix: '-FLOW' },
    { type: 'level', suffix: '-LVL' },
    { type: 'gas_leak', suffix: '-GAS' },
  ];

  const sensors: Sensor[] = [];
  equipments.forEach((eq) => {
    // Each equipment gets 2-4 sensors based on type
    const typesForEquip = sensorConfigs.filter((_, i) => {
      if (eq.name.includes('Compresseur')) return [0, 1, 2].includes(i);
      if (eq.name.includes('Turbine')) return [0, 1, 2, 3].includes(i);
      if (eq.name.includes('Pompe')) return [0, 1, 3].includes(i);
      if (eq.name.includes('Vanne')) return [1, 3].includes(i);
      if (eq.name.includes('Réservoir') || eq.name.includes('stockage')) return [0, 1, 4].includes(i);
      if (eq.name.includes('Pipeline')) return [1, 3, 5].includes(i);
      if (eq.name.includes('détente')) return [0, 1].includes(i);
      if (eq.name.includes('électrogène')) return [0, 1, 2].includes(i);
      if (eq.name.includes('Séparateur')) return [0, 1, 4].includes(i);
      return [0, 1].includes(i);
    });

    typesForEquip.forEach((config) => {
      const typeInfo = SENSOR_TYPES[config.type];
      const [min, max] = typeInfo.typicalRange;
      const range = max - min;
      const currentValue = min + Math.random() * range * 0.6 + range * 0.2;

      sensors.push({
        id: `${eq.id}${config.suffix}`,
        name: `${typeInfo.label} - ${eq.name.split(' ').slice(0, 2).join(' ')}`,
        type: config.type,
        unit: typeInfo.unit,
        equipmentId: eq.id,
        equipmentName: eq.name,
        site: eq.site,
        minValue: min,
        maxValue: max,
        alertLow: min + range * 0.15,
        alertHigh: min + range * 0.85,
        criticalLow: min + range * 0.05,
        criticalHigh: min + range * 0.95,
        currentValue: Math.round(currentValue * 100) / 100,
        status: Math.random() > 0.15 ? 'online' : (Math.random() > 0.5 ? 'warning' : 'critical'),
        lastReading: new Date(),
        battery: Math.round(60 + Math.random() * 40),
        signal: Math.round(70 + Math.random() * 30),
      });
    });
  });

  return sensors;
}

function generateReadingHistory(sensor: Sensor, points: number = 30): SensorReading[] {
  const readings: SensorReading[] = [];
  const typeInfo = SENSOR_TYPES[sensor.type];
  const [min, max] = typeInfo.typicalRange;
  const range = max - min;
  const now = Date.now();
  let value = sensor.currentValue;

  for (let i = points; i >= 0; i--) {
    // Simulate realistic fluctuations
    const noise = (Math.random() - 0.5) * range * 0.08;
    value = Math.max(min, Math.min(max, value + noise));
    const status: SensorReading['status'] =
      value >= sensor.criticalHigh || value <= sensor.criticalLow ? 'critical' :
      value >= sensor.alertHigh || value <= sensor.alertLow ? 'warning' : 'normal';

    readings.push({
      timestamp: new Date(now - i * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      value: Math.round(value * 100) / 100,
      status,
    });
  }
  return readings;
}

function generateAlerts(sensors: Sensor[]): IoTAlert[] {
  const alerts: IoTAlert[] = [];
  const now = Date.now();

  sensors.forEach((sensor) => {
    if (sensor.status === 'critical') {
      alerts.push({
        id: `alert-${sensor.id}-crit`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        sensorType: SENSOR_TYPES[sensor.type].label,
        equipmentName: sensor.equipmentName,
        site: sensor.site,
        type: 'critical',
        message: `Valeur critique: ${sensor.currentValue}${sensor.unit} (seuil: ${sensor.criticalHigh}${sensor.unit})`,
        value: sensor.currentValue,
        threshold: sensor.criticalHigh,
        unit: sensor.unit,
        timestamp: new Date(now - Math.random() * 3600000),
        acknowledged: false,
      });
    } else if (sensor.status === 'warning') {
      alerts.push({
        id: `alert-${sensor.id}-warn`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        sensorType: SENSOR_TYPES[sensor.type].label,
        equipmentName: sensor.equipmentName,
        site: sensor.site,
        type: 'warning',
        message: `Valeur élevée: ${sensor.currentValue}${sensor.unit} (seuil: ${sensor.alertHigh}${sensor.unit})`,
        value: sensor.currentValue,
        threshold: sensor.alertHigh,
        unit: sensor.unit,
        timestamp: new Date(now - Math.random() * 7200000),
        acknowledged: Math.random() > 0.5,
      });
    }
  });

  // Add some offline alerts
  const offlineSensors = sensors.filter(s => s.signal < 80);
  offlineSensors.forEach(s => {
    if (Math.random() > 0.7) {
      alerts.push({
        id: `alert-${s.id}-off`,
        sensorId: s.id,
        sensorName: s.name,
        sensorType: SENSOR_TYPES[s.type].label,
        equipmentName: s.equipmentName,
        site: s.site,
        type: 'offline',
        message: `Capteur hors ligne - Signal faible (${s.signal}%)`,
        value: 0,
        threshold: 0,
        unit: '',
        timestamp: new Date(now - Math.random() * 1800000),
        acknowledged: false,
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ─── Sub-Components ────────────────────────────────────────────
function StatusDot({ status }: { status: Sensor['status'] }) {
  const colors = {
    online: '#22C55E',
    offline: '#6B7280',
    warning: '#F59E0B',
    critical: '#EF4444',
  };
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full animate-pulse"
      style={{ backgroundColor: colors[status], boxShadow: `0 0 6px ${colors[status]}50` }}
    />
  );
}

function StatusBadge({ status }: { status: Sensor['status'] }) {
  const config = {
    online:   { label: 'En ligne', color: '#22C55E', bg: '#22C55E18' },
    offline:  { label: 'Hors ligne', color: '#6B7280', bg: '#6B728018' },
    warning:  { label: 'Alerte', color: '#F59E0B', bg: '#F59E0B18' },
    critical: { label: 'Critique', color: '#EF4444', bg: '#EF444418' },
  };
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.color}30` }}>
      <StatusDot status={status} />
      {c.label}
    </span>
  );
}

function AlertTypeIcon({ type }: { type: IoTAlert['type'] }) {
  switch (type) {
    case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'offline': return <WifiOff className="w-4 h-4 text-slate-400" />;
    case 'recovery': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  }
}

// ─── Main IoT View Component ──────────────────────────────────
export function IoTView() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [readingHistory, setReadingHistory] = useState<SensorReading[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize sensors
  useEffect(() => {
    const s = generateSensors();
    setSensors(s);
    setAlerts(generateAlerts(s));
    if (s.length > 0) setSelectedSensor(s[0]);
  }, []);

  // Live data simulation
  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        setSensors(prev => prev.map(sensor => {
          const typeInfo = SENSOR_TYPES[sensor.type];
          const [min, max] = typeInfo.typicalRange;
          const range = max - min;
          const noise = (Math.random() - 0.5) * range * 0.04;
          let newValue = sensor.currentValue + noise;
          newValue = Math.max(min, Math.min(max, newValue));
          newValue = Math.round(newValue * 100) / 100;

          const newStatus: Sensor['status'] =
            newValue >= sensor.criticalHigh || newValue <= sensor.criticalLow ? 'critical' :
            newValue >= sensor.alertHigh || newValue <= sensor.alertLow ? 'warning' :
            sensor.signal < 30 ? 'offline' : 'online';

          return {
            ...sensor,
            currentValue: newValue,
            status: newStatus,
            lastReading: new Date(),
            signal: Math.max(0, Math.min(100, sensor.signal + (Math.random() - 0.5) * 2)),
          };
        }));
      }, 3000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive]);

  // Update reading history when sensor changes or live data comes
  useEffect(() => {
    if (selectedSensor) {
      setReadingHistory(generateReadingHistory(selectedSensor));
    }
  }, [selectedSensor?.id]);

  useEffect(() => {
    if (selectedSensor && isLive) {
      setReadingHistory(prev => {
        const newReading: SensorReading = {
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: selectedSensor.currentValue,
          status: selectedSensor.status === 'critical' ? 'critical' : selectedSensor.status === 'warning' ? 'warning' : 'normal',
        };
        const updated = [...prev, newReading];
        return updated.slice(-30);
      });
    }
  }, [selectedSensor?.currentValue, isLive]);

  // Update alerts periodically
  useEffect(() => {
    const alertInterval = setInterval(() => {
      setAlerts(generateAlerts(sensors));
    }, 10000);
    return () => clearInterval(alertInterval);
  }, [sensors]);

  // Filtered sensors
  const filteredSensors = sensors.filter(s => {
    if (filterSite !== 'all' && s.site !== filterSite) return false;
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  // Stats
  const totalSensors = sensors.length;
  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const warningSensors = sensors.filter(s => s.status === 'warning').length;
  const criticalSensors = sensors.filter(s => s.status === 'critical').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  // Chart data for sensor type distribution
  const sensorTypeData = Object.entries(SENSOR_TYPES).map(([type, info]) => ({
    name: info.label,
    value: sensors.filter(s => s.type === type).length,
    color: info.color,
  }));

  // Chart data for site distribution
  const siteData = SITES.map(site => ({
    name: site,
    total: sensors.filter(s => s.site === site).length,
    online: sensors.filter(s => s.site === site && s.status === 'online').length,
    alert: sensors.filter(s => s.site === site && (s.status === 'warning' || s.status === 'critical')).length,
  })).filter(s => s.total > 0);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wifi className="w-6 h-6 text-teal-500" />
            IoT Capteurs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Surveillance en temps réel des équipements gaziers — {totalSensors} capteurs déployés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={isLive ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
          >
            {isLive ? (
              <><Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> En direct</>
            ) : (
              <><Radio className="w-3.5 h-3.5 mr-1.5" /> Pause</>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setSensors(generateSensors()); }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Actualiser
          </Button>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Capteurs totaux', value: totalSensors, icon: Radio, color: '#14B8A6', bg: '#14B8A618' },
          { label: 'En ligne', value: onlineSensors, icon: CheckCircle, color: '#22C55E', bg: '#22C55E18' },
          { label: 'Alertes', value: warningSensors, icon: AlertTriangle, color: '#F59E0B', bg: '#F59E0B18' },
          { label: 'Critiques', value: criticalSensors, icon: XCircle, color: '#EF4444', bg: '#EF444418' },
          { label: 'Alertes non acquittées', value: unacknowledgedAlerts, icon: Bell, color: '#8B5CF6', bg: '#8B5CF618' },
        ].map((kpi) => (
          <Card key={kpi.label} style={{ borderColor: `${kpi.color}30` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="sensors">
            Capteurs
            {criticalSensors > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center">{criticalSensors}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes
            {unacknowledgedAlerts > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center">{unacknowledgedAlerts}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        {/* ─── Dashboard Tab ─── */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sensor type distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Répartition par type de capteur</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={sensorTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sensorTypeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Site status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">État par site</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={siteData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A3A4A" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip />
                    <Bar dataKey="online" fill="#22C55E" name="En ligne" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="alert" fill="#F59E0B" name="Alerte" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time sensor detail */}
          {selectedSensor && (
            <Card style={{ borderColor: `${SENSOR_TYPES[selectedSensor.type].color}40` }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => { const Icon = SENSOR_TYPES[selectedSensor.type].icon; return <Icon className="w-5 h-5" style={{ color: SENSOR_TYPES[selectedSensor.type].color }} />; })()}
                    <div>
                      <CardTitle className="text-sm font-semibold">{selectedSensor.name}</CardTitle>
                      <p className="text-[10px] text-muted-foreground">{selectedSensor.equipmentName} — {selectedSensor.site}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedSensor.status} />
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Signal className="w-3 h-3" /> {Math.round(selectedSensor.signal)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Current value */}
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valeur actuelle</p>
                    <p className="text-4xl font-bold mt-2" style={{ color: SENSOR_TYPES[selectedSensor.type].color }}>
                      {selectedSensor.currentValue}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedSensor.unit}</p>
                    <div className="w-full mt-3 px-4">
                      <Progress
                        value={((selectedSensor.currentValue - selectedSensor.minValue) / (selectedSensor.maxValue - selectedSensor.minValue)) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                        <span>{selectedSensor.minValue}{selectedSensor.unit}</span>
                        <span>{selectedSensor.maxValue}{selectedSensor.unit}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-[10px]">
                      <span className="text-amber-500">⚠ Alerte: {selectedSensor.alertLow} — {selectedSensor.alertHigh}{selectedSensor.unit}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-[10px]">
                      <span className="text-red-500">🔴 Critique: {selectedSensor.criticalLow} — {selectedSensor.criticalHigh}{selectedSensor.unit}</span>
                    </div>
                  </div>
                  {/* Trend chart */}
                  <div className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={readingHistory}>
                        <defs>
                          <linearGradient id="sensorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SENSOR_TYPES[selectedSensor.type].color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={SENSOR_TYPES[selectedSensor.type].color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A3A4A" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#0B1929', border: '1px solid #1A3A4A', fontSize: 11 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={SENSOR_TYPES[selectedSensor.type].color}
                          fill="url(#sensorGradient)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick sensor cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sensors.filter(s => s.status !== 'online').slice(0, 8).map((sensor) => {
              const typeInfo = SENSOR_TYPES[sensor.type];
              const Icon = typeInfo.icon;
              return (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedSensor(sensor)}
                >
                  <Card className={`transition-colors ${selectedSensor?.id === sensor.id ? 'ring-2 ring-teal-500' : ''}`}
                    style={{ borderColor: sensor.status === 'critical' ? '#EF444440' : sensor.status === 'warning' ? '#F59E0B40' : '#1A3A4A' }}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4" style={{ color: typeInfo.color }} />
                        <StatusDot status={sensor.status} />
                      </div>
                      <p className="text-xs font-medium truncate">{sensor.name}</p>
                      <p className="text-lg font-bold mt-1" style={{ color: typeInfo.color }}>
                        {sensor.currentValue} <span className="text-xs font-normal text-muted-foreground">{sensor.unit}</span>
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-1">{sensor.site}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Sensors Tab ─── */}
        <TabsContent value="sensors" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterSite} onValueChange={setFilterSite}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les sites</SelectItem>
                {SITES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(SENSOR_TYPES).map(([key, info]) => (
                  <SelectItem key={key} value={key}>{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="online">En ligne</SelectItem>
                <SelectItem value="warning">Alerte</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="offline">Hors ligne</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground self-center ml-2">
              {filteredSensors.length} capteur(s) trouvé(s)
            </span>
          </div>

          {/* Sensor grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSensors.map((sensor) => {
              const typeInfo = SENSOR_TYPES[sensor.type];
              const Icon = typeInfo.icon;
              const isSelected = selectedSensor?.id === sensor.id;
              return (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.01 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedSensor(sensor)}
                >
                  <Card className={`transition-all ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                    style={{ borderColor: sensor.status === 'critical' ? '#EF444440' : sensor.status === 'warning' ? '#F59E0B40' : undefined }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: typeInfo.color + '18' }}>
                            <Icon className="w-4 h-4" style={{ color: typeInfo.color }} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{sensor.name}</p>
                            <p className="text-[9px] text-muted-foreground">{sensor.id}</p>
                          </div>
                        </div>
                        <StatusBadge status={sensor.status} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold" style={{ color: typeInfo.color }}>
                            {sensor.currentValue}
                            <span className="text-sm font-normal text-muted-foreground ml-1">{sensor.unit}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {sensor.site}</span>
                            <span className="flex items-center gap-0.5"><Signal className="w-2.5 h-2.5" /> {Math.round(sensor.signal)}%</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {sensor.lastReading.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] text-muted-foreground">Batterie</span>
                          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${sensor.battery}%`,
                              backgroundColor: sensor.battery > 50 ? '#22C55E' : sensor.battery > 20 ? '#F59E0B' : '#EF4444',
                            }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Alerts Tab ─── */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{alerts.length} alertes actives</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Tout acquitter
            </Button>
          </div>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune alerte active — Tous les capteurs fonctionnent normalement</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card style={{
                    borderColor: alert.type === 'critical' ? '#EF444440' : alert.type === 'warning' ? '#F59E0B40' : '#1A3A4A',
                    backgroundColor: alert.acknowledged ? 'transparent' : (alert.type === 'critical' ? '#EF444408' : alert.type === 'warning' ? '#F59E0B08' : 'transparent'),
                  }}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <AlertTypeIcon type={alert.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-semibold">{alert.sensorName}</p>
                            <Badge variant="outline" className="text-[9px] h-4">{alert.sensorType}</Badge>
                            {!alert.acknowledged && (
                              <Badge variant="destructive" className="text-[9px] h-4">Non acquittée</Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Server className="w-2.5 h-2.5" /> {alert.equipmentName}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {alert.site}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {alert.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => {
                              const s = sensors.find(s => s.id === alert.sensorId);
                              if (s) setSelectedSensor(s);
                              setActiveTab('dashboard');
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" /> Voir
                          </Button>
                          {!alert.acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Acquitter
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* ─── Analytics Tab ─── */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* All sensors trend overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Tendance globale par type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(SENSOR_TYPES).map(([type, info]) => {
                    const typeSensors = sensors.filter(s => s.type === type);
                    const avgValue = typeSensors.length > 0
                      ? typeSensors.reduce((sum, s) => sum + ((s.currentValue - s.minValue) / (s.maxValue - s.minValue) * 100), 0) / typeSensors.length
                      : 0;
                    return {
                      name: info.label,
                      moyenne: Math.round(avgValue),
                      alertes: typeSensors.filter(s => s.status === 'warning' || s.status === 'critical').length,
                      color: info.color,
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A3A4A" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                    <RechartsTooltip />
                    <Bar yAxisId="left" dataKey="moyenne" fill="#14B8A6" name="Charge moyenne (%)" radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="right" dataKey="alertes" fill="#EF4444" name="Nb alertes" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Selected sensor detailed history */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Historique — {selectedSensor?.name || 'Sélectionnez un capteur'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  {readingHistory.length > 0 ? (
                    <LineChart data={readingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A3A4A" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0B1929', border: '1px solid #1A3A4A', fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={selectedSensor ? SENSOR_TYPES[selectedSensor.type].color : '#14B8A6'}
                        strokeWidth={2}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.status === 'critical') return <circle cx={cx} cy={cy} r={3} fill="#EF4444" />;
                          if (payload.status === 'warning') return <circle cx={cx} cy={cy} r={3} fill="#F59E0B" />;
                          return <circle cx={cx} cy={cy} r={2} fill="#14B8A6" />;
                        }}
                      />
                    </LineChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Sélectionnez un capteur pour voir l'historique
                    </div>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sensor health matrix */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Matrice de santé des capteurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Équipement</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Site</th>
                      {Object.entries(SENSOR_TYPES).map(([key, info]) => (
                        <th key={key} className="text-center py-2 px-2 text-muted-foreground font-medium">
                          <info.icon className="w-3 h-3 mx-auto" style={{ color: info.color }} />
                          <span className="text-[8px]">{info.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...new Set(sensors.map(s => s.equipmentId))].map(eqId => {
                      const eqSensors = sensors.filter(s => s.equipmentId === eqId);
                      const eq = eqSensors[0];
                      return (
                        <tr key={eqId} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">{eq.equipmentName.split(' ').slice(0, 3).join(' ')}</td>
                          <td className="py-2 px-3 text-muted-foreground">{eq.site}</td>
                          {Object.keys(SENSOR_TYPES).map(type => {
                            const sensor = eqSensors.find(s => s.type === type);
                            if (!sensor) return <td key={type} className="py-2 px-2 text-center text-muted-foreground/30">—</td>;
                            const statusColors = { online: '#22C55E', offline: '#6B7280', warning: '#F59E0B', critical: '#EF4444' };
                            return (
                              <td key={type} className="py-2 px-2 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[sensor.status] }} />
                                  <span className="text-[9px]" style={{ color: statusColors[sensor.status] }}>
                                    {sensor.currentValue}{sensor.unit}
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
