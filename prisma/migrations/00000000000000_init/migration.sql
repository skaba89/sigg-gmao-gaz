-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TECHNICIEN',
    "avatar" TEXT,
    "phone" TEXT,
    "department" TEXT,
    "siteId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Guinée',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "type" TEXT NOT NULL DEFAULT 'DISTRIBUTION',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "floor" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "serialNumber" TEXT,
    "categoryId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "zoneId" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "criticality" TEXT NOT NULL DEFAULT 'MOYENNE',
    "status" TEXT NOT NULL DEFAULT 'OPERATIONNEL',
    "purchaseDate" TIMESTAMP(3),
    "installationDate" TIMESTAMP(3),
    "warrantyEnd" TIMESTAMP(3),
    "expectedLifespan" INTEGER,
    "currentHealthScore" INTEGER NOT NULL DEFAULT 100,
    "qrCode" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_documents" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_parameters" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "minThreshold" TEXT,
    "maxThreshold" TEXT,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "equipment_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CORRECTIVE',
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "priority" TEXT NOT NULL DEFAULT 'P3_MOYENNE',
    "equipmentId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "requestedById" TEXT,
    "supervisorId" TEXT,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "notes" TEXT,
    "signatureUrl" TEXT,
    "reportPdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_parts" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION,

    CONSTRAINT "work_order_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_checklists" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,

    CONSTRAINT "work_order_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_comments" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERIODIQUE',
    "frequency" TEXT NOT NULL DEFAULT 'MOIS',
    "frequencyValue" INTEGER NOT NULL DEFAULT 1,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "estimatedDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plan_tasks" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "estimatedMinutes" INTEGER,

    CONSTRAINT "maintenance_plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "equipmentId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MAJEURE',
    "status" TEXT NOT NULL DEFAULT 'OUVERT',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "rootCause" TEXT,
    "correctiveAction" TEXT,
    "workOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SECONDAIRE',
    "address" TEXT,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "part_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "manufacturer" TEXT,
    "partNumber" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'unite',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 0,
    "maxStockLevel" INTEGER,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER,
    "leadTimeDays" INTEGER,
    "imageUrl" TEXT,
    "specifications" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_stocks" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minLevel" INTEGER,
    "maxLevel" INTEGER,
    "location" TEXT,

    CONSTRAINT "warehouse_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference" TEXT,
    "workOrderId" TEXT,
    "performedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Guinée',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" INTEGER,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BROUILLON',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GNF',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "receivedQuantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" TEXT,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_costs" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT,
    "equipmentId" TEXT,
    "siteId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GNF',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntity" TEXT,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_records" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "period" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_siteId_idx" ON "users"("siteId");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_key" ON "token_blacklist"("token");
CREATE INDEX "token_blacklist_userId_idx" ON "token_blacklist"("userId");
CREATE INDEX "token_blacklist_expiresAt_idx" ON "token_blacklist"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sites_code_key" ON "sites"("code");
CREATE INDEX "sites_type_idx" ON "sites"("type");
CREATE INDEX "sites_isActive_idx" ON "sites"("isActive");

-- CreateIndex
CREATE INDEX "buildings_siteId_idx" ON "buildings"("siteId");
CREATE UNIQUE INDEX "buildings_code_siteId_key" ON "buildings"("code", "siteId");

-- CreateIndex
CREATE INDEX "zones_buildingId_idx" ON "zones"("buildingId");
CREATE UNIQUE INDEX "zones_code_buildingId_key" ON "zones"("code", "buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_categories_code_key" ON "equipment_categories"("code");
CREATE UNIQUE INDEX "equipment_code_key" ON "equipment"("code");
CREATE INDEX "equipment_categoryId_idx" ON "equipment"("categoryId");
CREATE INDEX "equipment_siteId_idx" ON "equipment"("siteId");
CREATE INDEX "equipment_zoneId_idx" ON "equipment"("zoneId");
CREATE INDEX "equipment_criticality_idx" ON "equipment"("criticality");
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "equipment_documents_equipmentId_idx" ON "equipment_documents"("equipmentId");
CREATE INDEX "equipment_parameters_equipmentId_idx" ON "equipment_parameters"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_code_key" ON "work_orders"("code");
CREATE INDEX "work_orders_equipmentId_idx" ON "work_orders"("equipmentId");
CREATE INDEX "work_orders_siteId_idx" ON "work_orders"("siteId");
CREATE INDEX "work_orders_assignedToId_idx" ON "work_orders"("assignedToId");
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");
CREATE INDEX "work_orders_priority_idx" ON "work_orders"("priority");
CREATE INDEX "work_orders_type_idx" ON "work_orders"("type");
CREATE INDEX "work_orders_plannedStartDate_idx" ON "work_orders"("plannedStartDate");

-- CreateIndex
CREATE INDEX "work_order_parts_workOrderId_idx" ON "work_order_parts"("workOrderId");
CREATE INDEX "work_order_parts_partId_idx" ON "work_order_parts"("partId");

-- CreateIndex
CREATE INDEX "work_order_checklists_workOrderId_idx" ON "work_order_checklists"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_comments_workOrderId_idx" ON "work_order_comments"("workOrderId");
CREATE INDEX "work_order_comments_userId_idx" ON "work_order_comments"("userId");
CREATE INDEX "work_order_comments_createdAt_idx" ON "work_order_comments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_plans_code_key" ON "maintenance_plans"("code");
CREATE INDEX "maintenance_plans_equipmentId_idx" ON "maintenance_plans"("equipmentId");
CREATE INDEX "maintenance_plans_nextDueDate_idx" ON "maintenance_plans"("nextDueDate");
CREATE INDEX "maintenance_plans_isActive_idx" ON "maintenance_plans"("isActive");

-- CreateIndex
CREATE INDEX "maintenance_plan_tasks_planId_idx" ON "maintenance_plan_tasks"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_code_key" ON "incidents"("code");
CREATE INDEX "incidents_equipmentId_idx" ON "incidents"("equipmentId");
CREATE INDEX "incidents_siteId_idx" ON "incidents"("siteId");
CREATE INDEX "incidents_reportedById_idx" ON "incidents"("reportedById");
CREATE INDEX "incidents_severity_idx" ON "incidents"("severity");
CREATE INDEX "incidents_status_idx" ON "incidents"("status");
CREATE INDEX "incidents_detectedAt_idx" ON "incidents"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
CREATE UNIQUE INDEX "warehouses_managerId_key" ON "warehouses"("managerId");
CREATE INDEX "warehouses_siteId_idx" ON "warehouses"("siteId");
CREATE INDEX "warehouses_isActive_idx" ON "warehouses"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "part_categories_code_key" ON "part_categories"("code");
CREATE UNIQUE INDEX "parts_code_key" ON "parts"("code");
CREATE INDEX "parts_categoryId_idx" ON "parts"("categoryId");
CREATE INDEX "parts_isActive_idx" ON "parts"("isActive");
CREATE INDEX "parts_code_idx" ON "parts"("code");

-- CreateIndex
CREATE INDEX "warehouse_stocks_warehouseId_idx" ON "warehouse_stocks"("warehouseId");
CREATE INDEX "warehouse_stocks_partId_idx" ON "warehouse_stocks"("partId");
CREATE UNIQUE INDEX "warehouse_stocks_warehouseId_partId_key" ON "warehouse_stocks"("warehouseId", "partId");

-- CreateIndex
CREATE INDEX "stock_movements_partId_idx" ON "stock_movements"("partId");
CREATE INDEX "stock_movements_warehouseId_idx" ON "stock_movements"("warehouseId");
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");
CREATE INDEX "stock_movements_workOrderId_idx" ON "stock_movements"("workOrderId");
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");
CREATE INDEX "suppliers_isActive_idx" ON "suppliers"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_code_key" ON "purchase_orders"("code");
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");
CREATE INDEX "purchase_orders_requestedById_idx" ON "purchase_orders"("requestedById");
CREATE INDEX "purchase_orders_approvedById_idx" ON "purchase_orders"("approvedById");
CREATE INDEX "purchase_orders_orderDate_idx" ON "purchase_orders"("orderDate");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");
CREATE INDEX "purchase_order_items_partId_idx" ON "purchase_order_items"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_code_key" ON "cost_centers"("code");
CREATE INDEX "cost_centers_siteId_idx" ON "cost_centers"("siteId");
CREATE INDEX "cost_centers_period_idx" ON "cost_centers"("period");

-- CreateIndex
CREATE INDEX "maintenance_costs_workOrderId_idx" ON "maintenance_costs"("workOrderId");
CREATE INDEX "maintenance_costs_equipmentId_idx" ON "maintenance_costs"("equipmentId");
CREATE INDEX "maintenance_costs_siteId_idx" ON "maintenance_costs"("siteId");
CREATE INDEX "maintenance_costs_type_idx" ON "maintenance_costs"("type");
CREATE INDEX "maintenance_costs_date_idx" ON "maintenance_costs"("date");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "kpi_records_siteId_idx" ON "kpi_records"("siteId");
CREATE INDEX "kpi_records_metric_idx" ON "kpi_records"("metric");
CREATE INDEX "kpi_records_period_idx" ON "kpi_records"("period");
CREATE INDEX "kpi_records_recordedAt_idx" ON "kpi_records"("recordedAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "token_blacklist" ADD CONSTRAINT "token_blacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "zones" ADD CONSTRAINT "zones_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "equipment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "equipment_parameters" ADD CONSTRAINT "equipment_parameters_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_order_parts" ADD CONSTRAINT "work_order_parts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_order_checklists" ADD CONSTRAINT "work_order_checklists_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_order_checklists" ADD CONSTRAINT "work_order_checklists_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_order_comments" ADD CONSTRAINT "work_order_comments_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_order_comments" ADD CONSTRAINT "work_order_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_plans" ADD CONSTRAINT "maintenance_plans_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_plan_tasks" ADD CONSTRAINT "maintenance_plan_tasks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "maintenance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "parts" ADD CONSTRAINT "parts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "part_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "warehouse_stocks" ADD CONSTRAINT "warehouse_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "warehouse_stocks" ADD CONSTRAINT "warehouse_stocks_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_costs" ADD CONSTRAINT "maintenance_costs_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "maintenance_costs" ADD CONSTRAINT "maintenance_costs_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "maintenance_costs" ADD CONSTRAINT "maintenance_costs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kpi_records" ADD CONSTRAINT "kpi_records_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
