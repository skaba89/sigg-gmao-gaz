import { NextResponse } from 'next/server';

// Simulated IoT sensors data
const SITES = ['Conakry', 'Kamsar', 'Boké', 'Nzérékoré', 'Labé', 'Kindia'];

const SENSOR_TYPES = {
  temperature: { label: 'Température', unit: '°C', color: '#EF4444', range: [20, 120] },
  pressure:    { label: 'Pression', unit: 'bar', color: '#3B82F6', range: [1, 25] },
  vibration:   { label: 'Vibration', unit: 'mm/s', color: '#F97316', range: [0.5, 15] },
  flow:        { label: 'Débit', unit: 'm³/h', color: '#06B6D4', range: [50, 500] },
  level:       { label: 'Niveau', unit: '%', color: '#8B5CF6', range: [10, 100] },
  gas_leak:    { label: 'Fuite gaz', unit: 'ppm', color: '#DC2626', range: [0, 50] },
};

function generateSensors() {
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

  const sensors: any[] = [];
  equipments.forEach(eq => {
    Object.entries(SENSOR_TYPES).forEach(([type, info]: [string, any]) => {
      const [min, max] = info.range;
      const range = max - min;
      const value = min + Math.random() * range * 0.6 + range * 0.2;
      sensors.push({
        id: `${eq.id}-${type.toUpperCase().replace('_', '-')}`,
        name: `${info.label} - ${eq.name.split(' ').slice(0, 2).join(' ')}`,
        type,
        unit: info.unit,
        equipmentId: eq.id,
        equipmentName: eq.name,
        site: eq.site,
        minValue: min,
        maxValue: max,
        alertLow: min + range * 0.15,
        alertHigh: min + range * 0.85,
        criticalLow: min + range * 0.05,
        criticalHigh: min + range * 0.95,
        currentValue: Math.round(value * 100) / 100,
        status: Math.random() > 0.15 ? 'online' : (Math.random() > 0.5 ? 'warning' : 'critical'),
        lastReading: new Date().toISOString(),
        battery: Math.round(60 + Math.random() * 40),
        signal: Math.round(70 + Math.random() * 30),
      });
    });
  });
  return sensors;
}

let cachedSensors: any[] = [];
let lastGenerated = 0;

function getSensors() {
  const now = Date.now();
  if (now - lastGenerated > 5000 || cachedSensors.length === 0) {
    cachedSensors = generateSensors();
    lastGenerated = now;
  }
  return cachedSensors;
}

export async function GET() {
  try {
    const sensors = getSensors();
    return NextResponse.json(sensors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sensors = getSensors();
    const newSensor = {
      id: `SENSOR-${Date.now()}`,
      ...body,
      currentValue: 0,
      status: 'offline',
      lastReading: new Date().toISOString(),
      battery: 100,
      signal: 0,
    };
    sensors.push(newSensor);
    return NextResponse.json(newSensor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
