---
Task ID: iot-module
Agent: Main Agent
Task: Implement complete IoT module in SIGG GMAO platform

Work Log:
- Updated ModuleKey type in app-store.ts to include 'iot'
- Added IoT navigation item in app-sidebar.tsx (section: SURVEILLANCE, icon: Wifi)
- Added IoTView import and route in app/page.tsx
- Updated api.ts with 8 IoT API methods (sensors, readings, alerts, dashboard)
- Created iot-view.tsx (700+ lines) with:
  - Real-time simulated sensor data (28 sensors across 10 equipments, 6 sites)
  - 6 sensor types: temperature, pressure, vibration, flow, level, gas_leak
  - Live data updates every 3 seconds with realistic fluctuations
  - KPI cards (total, online, warning, critical, unacknowledged alerts)
  - 4 tabs: Dashboard, Sensors, Alerts, Analytics
  - Interactive sensor cards with click-to-select detail view
  - Real-time area chart for selected sensor
  - Pie chart for sensor type distribution
  - Bar chart for site status
  - Sensor health matrix table
  - Alert list with acknowledge functionality
  - Filters by site, type, status
- Created 5 API routes:
  - GET/POST /api/iot/sensors
  - GET/PUT /api/iot/sensors/[id]
  - GET /api/iot/readings/[sensorId]
  - GET /api/iot/alerts
  - PUT /api/iot/alerts/[id]
  - GET /api/iot/dashboard
- Integrated IoT with MANTIS chatbot (prompts, labels, welcome messages)
- Updated app-header with IoT module title and search terms
- Build successful with zero errors

Stage Summary:
- Complete IoT module deployed with real-time monitoring
- 28 simulated sensors across 6 sites and 10 equipments
- Live data with 3-second refresh interval
- Alert system with critical/warning/offline detection
- Full MANTIS AI integration for IoT data analysis
- All API endpoints functional
