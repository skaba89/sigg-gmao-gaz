const API_BASE = '/api';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: (token: string) =>
    apiFetch<any>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  // Dashboard
  getDashboardStats: () => apiFetch<any>('/dashboard/stats'),
  getDashboardKPI: (params?: string) => apiFetch<any>(`/dashboard/kpi${params ? `?${params}` : ''}`),
  getDashboardCharts: (params?: string) => apiFetch<any>(`/dashboard/charts${params ? `?${params}` : ''}`),

  // Equipment
  getEquipment: (params?: string) => apiFetch<any>(`/equipment${params ? `?${params}` : ''}`),
  getEquipmentById: (id: string) => apiFetch<any>(`/equipment/${id}`),
  createEquipment: (data: any) => apiFetch<any>('/equipment', { method: 'POST', body: JSON.stringify(data) }),
  updateEquipment: (id: string, data: any) => apiFetch<any>(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Work Orders
  getWorkOrders: (params?: string) => apiFetch<any>(`/work-orders${params ? `?${params}` : ''}`),
  getWorkOrderById: (id: string) => apiFetch<any>(`/work-orders/${id}`),
  createWorkOrder: (data: any) => apiFetch<any>('/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkOrder: (id: string, data: any) => apiFetch<any>(`/work-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Incidents
  getIncidents: (params?: string) => apiFetch<any>(`/incidents${params ? `?${params}` : ''}`),
  getIncidentById: (id: string) => apiFetch<any>(`/incidents/${id}`),
  createIncident: (data: any) => apiFetch<any>('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateIncident: (id: string, data: any) => apiFetch<any>(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Maintenance Plans
  getMaintenancePlans: (params?: string) => apiFetch<any>(`/maintenance-plans${params ? `?${params}` : ''}`),
  createMaintenancePlan: (data: any) => apiFetch<any>('/maintenance-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenancePlan: (id: string, data: any) => apiFetch<any>(`/maintenance-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Stock
  getParts: (params?: string) => apiFetch<any>(`/stock/parts${params ? `?${params}` : ''}`),
  createPart: (data: any) => apiFetch<any>('/stock/parts', { method: 'POST', body: JSON.stringify(data) }),
  updatePart: (id: string, data: any) => apiFetch<any>(`/stock/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getWarehouses: () => apiFetch<any>('/stock/warehouses'),
  getStockMovements: (params?: string) => apiFetch<any>(`/stock/movements${params ? `?${params}` : ''}`),
  createStockMovement: (data: any) => apiFetch<any>('/stock/movements', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => apiFetch<any>('/stock/suppliers'),
  getPurchaseOrders: () => apiFetch<any>('/stock/purchase-orders'),

  // Financial
  getCosts: (params?: string) => apiFetch<any>(`/financial/costs${params ? `?${params}` : ''}`),
  getCostCenters: () => apiFetch<any>('/financial/cost-centers'),
  getFinancialSummary: () => apiFetch<any>('/financial/summary'),

  // Users & Sites
  getUsers: () => apiFetch<any>('/users'),
  getSites: () => apiFetch<any>('/sites'),

  // Notifications
  getNotifications: () => apiFetch<any>('/notifications'),
  markNotificationRead: (id: string) => apiFetch<any>(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify({}) }),

  // Audit
  getAuditLogs: (params?: string) => apiFetch<any>(`/audit${params ? `?${params}` : ''}`),

  // AI
  sendAIChat: (message: string, history?: Array<{ role: string; content: string }>, context?: string) =>
    apiFetch<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, context }),
    }),

  // File Generation
  generateFile: (data: any, format: string, fileName: string) =>
    apiFetch<any>('/ai/generate-file', {
      method: 'POST',
      body: JSON.stringify({ data, format, fileName }),
    }),

  // IoT
  getIoTSensors: () => apiFetch<any>('/iot/sensors'),
  getIoTSensorById: (id: string) => apiFetch<any>(`/iot/sensors/${id}`),
  createIoTSensor: (data: any) => apiFetch<any>('/iot/sensors', { method: 'POST', body: JSON.stringify(data) }),
  updateIoTSensor: (id: string, data: any) => apiFetch<any>(`/iot/sensors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getIoTReadings: (sensorId: string, params?: string) => apiFetch<any>(`/iot/readings/${sensorId}${params ? `?${params}` : ''}`),
  getIoTAlerts: (params?: string) => apiFetch<any>(`/iot/alerts${params ? `?${params}` : ''}`),
  updateIoTAlert: (id: string, data: any) => apiFetch<any>(`/iot/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getIoTDashboard: () => apiFetch<any>('/iot/dashboard'),

  // Seed
  seedDatabase: () => apiFetch<any>('/seed'),
};

// Format currency in GNF
export function formatGNF(amount: number): string {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
}

// Format number with space separator (French style)
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

// Format date in French
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
