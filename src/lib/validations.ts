// ============================================================
// Zod Validation Schemas - SIGG GMAO Platform
// All API input validation schemas for request body validation
// ============================================================

import { z } from 'zod/v4';

// ---- Common ----
export const cuidSchema = z.string().min(1, 'ID requis');
export const emailSchema = z.email('Email invalide');
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ---- Auth ----
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
  name: z.string().min(1, 'Nom requis').max(100),
  role: z.enum([
    'SUPER_ADMIN',
    'DIRECTION_GENERALE',
    'RESP_MAINTENANCE',
    'RESP_STOCK',
    'TECHNICIEN',
    'AUDITEUR',
    'FINANCE',
    'PRESTATAIRE',
  ]).default('TECHNICIEN'),
  phone: z.string().optional(),
  department: z.string().optional(),
  siteId: z.string().optional(),
});

// ---- Users ----
export const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
  name: z.string().min(1, 'Nom requis').max(100),
  role: z.enum([
    'SUPER_ADMIN',
    'DIRECTION_GENERALE',
    'RESP_MAINTENANCE',
    'RESP_STOCK',
    'TECHNICIEN',
    'AUDITEUR',
    'FINANCE',
    'PRESTATAIRE',
  ]).default('TECHNICIEN'),
  phone: z.string().optional(),
  department: z.string().optional(),
  siteId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum([
    'SUPER_ADMIN',
    'DIRECTION_GENERALE',
    'RESP_MAINTENANCE',
    'RESP_STOCK',
    'TECHNICIEN',
    'AUDITEUR',
    'FINANCE',
    'PRESTATAIRE',
  ]).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  siteId: z.string().optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être modifié',
});

// ---- Equipment ----
export const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  code: z.string().min(1, 'Code requis').max(50),
  serialNumber: z.string().optional(),
  categoryId: z.string().min(1, 'Catégorie requise'),
  siteId: z.string().min(1, 'Site requis'),
  zoneId: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  criticality: z.enum(['CRITIQUE', 'IMPORTANTE', 'MOYENNE', 'FAIBLE']).default('MOYENNE'),
  status: z.enum(['OPERATIONNEL', 'HORS_SERVICE', 'EN_MAINTENANCE', 'EN_PANNE', 'MIS_AU_REBUT']).default('OPERATIONNEL'),
  purchaseDate: z.string().optional(),
  installationDate: z.string().optional(),
  warrantyEnd: z.string().optional(),
  expectedLifespan: z.number().int().positive().optional(),
  currentHealthScore: z.number().int().min(0).max(100).default(100),
  qrCode: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateEquipmentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  serialNumber: z.string().optional(),
  categoryId: z.string().optional(),
  siteId: z.string().optional(),
  zoneId: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  criticality: z.enum(['CRITIQUE', 'IMPORTANTE', 'MOYENNE', 'FAIBLE']).optional(),
  status: z.enum(['OPERATIONNEL', 'HORS_SERVICE', 'EN_MAINTENANCE', 'EN_PANNE', 'MIS_AU_REBUT']).optional(),
  purchaseDate: z.string().optional(),
  installationDate: z.string().optional(),
  warrantyEnd: z.string().optional(),
  expectedLifespan: z.number().int().positive().optional(),
  currentHealthScore: z.number().int().min(0).max(100).optional(),
  qrCode: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être modifié',
});

// ---- Work Orders ----
export const createWorkOrderSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(300),
  description: z.string().optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'AMELIORATIVE', 'URGENTE']).default('CORRECTIVE'),
  status: z.enum(['EN_ATTENTE', 'PLANIFIEE', 'EN_COURS', 'SUSPENDUE', 'TERMINEE', 'VALIDEE', 'CRITIQUE']).default('EN_ATTENTE'),
  priority: z.enum(['P1_CRITIQUE', 'P2_HAUTE', 'P3_MOYENNE', 'P4_BASSE']).default('P3_MOYENNE'),
  equipmentId: z.string().min(1, 'Equipement requis'),
  siteId: z.string().min(1, 'Site requis'),
  assignedToId: z.string().optional(),
  requestedById: z.string().optional(),
  supervisorId: z.string().optional(),
  plannedStartDate: z.string().optional(),
  plannedEndDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateWorkOrderSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'AMELIORATIVE', 'URGENTE']).optional(),
  status: z.enum(['EN_ATTENTE', 'PLANIFIEE', 'EN_COURS', 'SUSPENDUE', 'TERMINEE', 'VALIDEE', 'CRITIQUE']).optional(),
  priority: z.enum(['P1_CRITIQUE', 'P2_HAUTE', 'P3_MOYENNE', 'P4_BASSE']).optional(),
  assignedToId: z.string().nullable().optional(),
  requestedById: z.string().nullable().optional(),
  supervisorId: z.string().nullable().optional(),
  plannedStartDate: z.string().nullable().optional(),
  plannedEndDate: z.string().nullable().optional(),
  actualStartDate: z.string().nullable().optional(),
  actualEndDate: z.string().nullable().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  actualHours: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  signatureUrl: z.string().nullable().optional(),
  reportPdfUrl: z.string().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être modifié',
});

// ---- Incidents ----
export const createIncidentSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(300),
  description: z.string().optional(),
  equipmentId: z.string().min(1, 'Equipement requis'),
  siteId: z.string().min(1, 'Site requis'),
  severity: z.enum(['MINEURE', 'MAJEURE', 'CRITIQUE']).default('MAJEURE'),
  status: z.enum(['OUVERT', 'EN_COURS', 'RESOLU', 'CLOTURE']).default('OUVERT'),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
  workOrderId: z.string().optional(),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().optional(),
  severity: z.enum(['MINEURE', 'MAJEURE', 'CRITIQUE']).optional(),
  status: z.enum(['OUVERT', 'EN_COURS', 'RESOLU', 'CLOTURE']).optional(),
  rootCause: z.string().nullable().optional(),
  correctiveAction: z.string().nullable().optional(),
  workOrderId: z.string().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être modifié',
});

// ---- Stock / Parts ----
export const createPartSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  code: z.string().min(1, 'Code requis').max(50),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Catégorie requise'),
  manufacturer: z.string().optional(),
  partNumber: z.string().optional(),
  unit: z.string().default('unite'),
  unitPrice: z.number().nonnegative().default(0),
  minStockLevel: z.number().int().nonnegative().default(0),
  maxStockLevel: z.number().int().positive().optional(),
  currentStock: z.number().int().nonnegative().default(0),
  reorderPoint: z.number().int().nonnegative().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  imageUrl: z.string().optional(),
  specifications: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updatePartSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  manufacturer: z.string().optional(),
  partNumber: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
  minStockLevel: z.number().int().nonnegative().optional(),
  maxStockLevel: z.number().int().positive().optional(),
  currentStock: z.number().int().nonnegative().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  imageUrl: z.string().optional(),
  specifications: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être modifié',
});

// ---- Stock Movements ----
export const stockMovementTypeSchema = z.enum(['ENTREE', 'SORTIE', 'TRANSFERT', 'AJUSTEMENT', 'RETOUR']);

export const createStockMovementSchema = z.object({
  partId: z.string().min(1, 'Pièce requise'),
  warehouseId: z.string().min(1, 'Entrepôt requis'),
  type: stockMovementTypeSchema,
  quantity: z.number().int().positive('Quantité doit être positive'),
  reference: z.string().optional(),
  workOrderId: z.string().optional(),
  performedById: z.string().min(1, 'Opérateur requis'),
  notes: z.string().optional(),
});

// ---- Sites ----
export const createSiteSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  code: z.string().min(1, 'Code requis').max(20),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Guinée'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  type: z.enum(['CENTRAL', 'DISTRIBUTION', 'PRODUCTION', 'STOCKAGE']).default('DISTRIBUTION'),
  isActive: z.boolean().default(true),
});

// ---- Maintenance Plans ----
export const createMaintenancePlanSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(300),
  code: z.string().min(1, 'Code requis').max(50),
  equipmentId: z.string().min(1, 'Equipement requis'),
  type: z.enum(['PERIODIQUE', 'CONDITIONNELLE', 'PREDICTIVE']).default('PERIODIQUE'),
  frequency: z.enum(['JOUR', 'SEMAINE', 'MOIS', 'TRIMESTRE', 'SEMESTRE', 'ANNUEL']).default('MOIS'),
  frequencyValue: z.number().int().positive().default(1),
  nextDueDate: z.string().min(1, 'Date prochaine échéance requise'),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
  estimatedDuration: z.number().int().positive().optional(),
});

// ---- Warehouses ----
export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  code: z.string().min(1, 'Code requis').max(20),
  siteId: z.string().min(1, 'Site requis'),
  type: z.enum(['CENTRAL', 'SECONDAIRE', 'MOBILE']).default('SECONDAIRE'),
  address: z.string().optional(),
  managerId: z.string().optional(),
  isActive: z.boolean().default(true),
});

// ---- Suppliers ----
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  code: z.string().min(1, 'Code requis').max(20),
  contactName: z.string().optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Guinée'),
  isActive: z.boolean().default(true),
  rating: z.number().int().min(1).max(5).optional(),
});

// ---- Purchase Orders ----
export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Fournisseur requis'),
  notes: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(z.object({
    partId: z.string().min(1, 'Pièce requise'),
    quantity: z.number().int().positive('Quantité doit être positive'),
    unitPrice: z.number().nonnegative('Prix unitaire requis'),
  })).min(1, 'Au moins un article requis'),
});

// ---- Notifications ----
export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'Utilisateur requis'),
  title: z.string().min(1, 'Titre requis').max(200),
  message: z.string().min(1, 'Message requis'),
  type: z.enum(['EMAIL', 'SMS', 'PUSH', 'IN_APP']).default('IN_APP'),
  relatedEntity: z.string().optional(),
  relatedEntityId: z.string().optional(),
});

// ---- AI Chat ----
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message requis').max(5000),
  context: z.string().optional(),
});

// ---- IoT Sensors ----
export const createIoTSensorSchema = z.object({
  code: z.string().min(1, 'Code requis').max(50),
  name: z.string().min(1, 'Nom requis').max(200),
  type: z.enum(['TEMPERATURE', 'PRESSURE', 'VIBRATION', 'FLOW', 'LEVEL', 'GAS_LEAK']),
  unit: z.string().min(1, 'Unité requise').max(20),
  equipmentId: z.string().min(1, 'Equipement requis'),
  siteId: z.string().min(1, 'Site requis'),
  minValue: z.number(),
  maxValue: z.number(),
  alertLow: z.number().optional(),
  alertHigh: z.number().optional(),
  criticalLow: z.number().optional(),
  criticalHigh: z.number().optional(),
});

// ---- Financial Costs ----
export const createMaintenanceCostSchema = z.object({
  workOrderId: z.string().optional(),
  equipmentId: z.string().optional(),
  siteId: z.string().min(1, 'Site requis'),
  type: z.enum(['MAIN_DOEUVRE', 'PIECES', 'OUTILLAGE', 'SOUS_TRAITANCE', 'AUTRE']),
  amount: z.number().positive('Montant doit être positif'),
  currency: z.string().default('GNF'),
  date: z.string().optional(),
  description: z.string().optional(),
});

// ---- Helper: Validate and return parsed data or error response ----
export function validateOrThrow<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Validation: ${errors}`);
  }
  return result.data;
}
