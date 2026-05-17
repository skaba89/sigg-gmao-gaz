-- CreateTable: IoT Sensors
CREATE TABLE "iot_sensors" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "alertLow" DOUBLE PRECISION,
    "alertHigh" DOUBLE PRECISION,
    "criticalLow" DOUBLE PRECISION,
    "criticalHigh" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "battery" INTEGER,
    "signal" INTEGER,
    "lastReading" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iot_sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable: IoT Readings
CREATE TABLE "iot_readings" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iot_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: IoT Alerts
CREATE TABLE "iot_alerts" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "iot_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "iot_sensors_code_key" ON "iot_sensors"("code");
CREATE INDEX "iot_sensors_equipmentId_idx" ON "iot_sensors"("equipmentId");
CREATE INDEX "iot_sensors_siteId_idx" ON "iot_sensors"("siteId");
CREATE INDEX "iot_sensors_type_idx" ON "iot_sensors"("type");
CREATE INDEX "iot_sensors_status_idx" ON "iot_sensors"("status");
CREATE INDEX "iot_sensors_isActive_idx" ON "iot_sensors"("isActive");

CREATE INDEX "iot_readings_sensorId_idx" ON "iot_readings"("sensorId");
CREATE INDEX "iot_readings_status_idx" ON "iot_readings"("status");
CREATE INDEX "iot_readings_recordedAt_idx" ON "iot_readings"("recordedAt");

CREATE INDEX "iot_alerts_sensorId_idx" ON "iot_alerts"("sensorId");
CREATE INDEX "iot_alerts_type_idx" ON "iot_alerts"("type");
CREATE INDEX "iot_alerts_isAcknowledged_idx" ON "iot_alerts"("isAcknowledged");
CREATE INDEX "iot_alerts_createdAt_idx" ON "iot_alerts"("createdAt");

-- AddForeignKey
ALTER TABLE "iot_sensors" ADD CONSTRAINT "iot_sensors_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "iot_sensors" ADD CONSTRAINT "iot_sensors_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "iot_readings" ADD CONSTRAINT "iot_readings_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "iot_sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "iot_sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "iot_alerts" ADD CONSTRAINT "iot_alerts_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
