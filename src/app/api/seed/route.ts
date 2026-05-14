import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';

export async function GET() {
  try {
    // Check if already seeded
    const siteCount = await db.site.count();
    if (siteCount > 0) {
      return Response.json({ message: 'Database already seeded. Reset first to re-seed.', siteCount });
    }

    console.log('🌱 Seeding SIGG GMAO database...');

    // ============================================================
    // 1. SITES
    // ============================================================
    const sites = await Promise.all([
      db.site.create({ data: { name: 'Conakry Central', code: 'CKY-001', address: 'Almamya, Conakry', city: 'Conakry', country: 'Guinée', latitude: 9.5092, longitude: -13.7122, type: 'CENTRAL', isActive: true } }),
      db.site.create({ data: { name: 'Kamsar Production', code: 'KMR-001', address: 'Zone Industrielle, Kamsar', city: 'Kamsar', country: 'Guinée', latitude: 11.0167, longitude: -14.4333, type: 'PRODUCTION', isActive: true } }),
      db.site.create({ data: { name: 'Boké Distribution', code: 'BKE-001', address: 'Centre Ville, Boké', city: 'Boké', country: 'Guinée', latitude: 10.9333, longitude: -14.3000, type: 'DISTRIBUTION', isActive: true } }),
      db.site.create({ data: { name: 'Nzérékoré Station', code: 'NZR-001', address: 'Route de Beyla, Nzérékoré', city: 'Nzérékoré', country: 'Guinée', latitude: 7.7500, longitude: -8.8167, type: 'DISTRIBUTION', isActive: true } }),
      db.site.create({ data: { name: 'Kindia Stockage', code: 'KND-001', address: 'Zone Artisanale, Kindia', city: 'Kindia', country: 'Guinée', latitude: 10.0667, longitude: -12.8667, type: 'STOCKAGE', isActive: true } }),
      db.site.create({ data: { name: 'Siguiri Poste', code: 'SGR-001', address: 'Route Nationale, Siguiri', city: 'Siguiri', country: 'Guinée', latitude: 11.4167, longitude: -9.1667, type: 'DISTRIBUTION', isActive: true } }),
    ]);

    const [conakry, kamsar, boke, nzerekore, kindia, siguiri] = sites;

    // ============================================================
    // 2. USERS
    // ============================================================
    const hashedPasswords = await Promise.all([
      hashPassword('admin123'),
      hashPassword('demo123'),
    ]);
    const adminPw = hashedPasswords[0];
    const demoPw = hashedPasswords[1];

    const users = await Promise.all([
      db.user.create({ data: { email: 'admin@sigg-gn.com', name: 'Amadou Diallo', password: adminPw, role: 'SUPER_ADMIN', phone: '+224 620 00 00 01', department: 'Direction Générale', siteId: conakry.id, isActive: true } }),
      db.user.create({ data: { email: 'dg@sigg-gn.com', name: 'Marie Condé', password: demoPw, role: 'DIRECTION_GENERALE', phone: '+224 620 00 00 02', department: 'Direction Générale', siteId: conakry.id, isActive: true } }),
      db.user.create({ data: { email: 'resp.maint@sigg-gn.com', name: 'Ibrahima Camara', password: demoPw, role: 'RESP_MAINTENANCE', phone: '+224 620 00 00 03', department: 'Maintenance', siteId: conakry.id, isActive: true } }),
      db.user.create({ data: { email: 'resp.stock@sigg-gn.com', name: 'Fatoumata Bah', password: demoPw, role: 'RESP_STOCK', phone: '+224 620 00 00 04', department: 'Logistique', siteId: kamsar.id, isActive: true } }),
      db.user.create({ data: { email: 'tech1@sigg-gn.com', name: 'Mamadou Sylla', password: demoPw, role: 'TECHNICIEN', phone: '+224 620 00 00 05', department: 'Maintenance', siteId: conakry.id, isActive: true } }),
      db.user.create({ data: { email: 'tech2@sigg-gn.com', name: 'Aboubacar Touré', password: demoPw, role: 'TECHNICIEN', phone: '+224 620 00 00 06', department: 'Maintenance', siteId: kamsar.id, isActive: true } }),
      db.user.create({ data: { email: 'tech3@sigg-gn.com', name: 'Kadiatou Kouyaté', password: demoPw, role: 'TECHNICIEN', phone: '+224 620 00 00 07', department: 'Maintenance', siteId: boke.id, isActive: true } }),
      db.user.create({ data: { email: 'auditeur@sigg-gn.com', name: 'Seydou Traoré', password: demoPw, role: 'AUDITEUR', phone: '+224 620 00 00 08', department: 'Qualité', siteId: conakry.id, isActive: true } }),
      db.user.create({ data: { email: 'finance@sigg-gn.com', name: 'Aissatou Diop', password: demoPw, role: 'FINANCE', phone: '+224 620 00 00 09', department: 'Finance', siteId: conakry.id, isActive: true } }),
      db.user.create({ data: { email: 'prestataire@sigg-gn.com', name: 'Jean-Marc Dupont', password: demoPw, role: 'PRESTATAIRE', phone: '+224 620 00 00 10', department: 'Sous-traitance', siteId: kamsar.id, isActive: true } }),
    ]);

    const [admin, dg, respMaint, respStock, tech1, tech2, tech3, auditeur, finance, prestataire] = users;

    // ============================================================
    // 3. EQUIPMENT CATEGORIES
    // ============================================================
    const categories = await Promise.all([
      db.equipmentCategory.create({ data: { name: 'Pipelines', code: 'PIPE', description: 'Canalisations de transport de gaz', icon: 'git-branch' } }),
      db.equipmentCategory.create({ data: { name: 'Compresseurs', code: 'COMP', description: 'Compresseurs de gaz naturel', icon: 'wind' } }),
      db.equipmentCategory.create({ data: { name: 'Turbines', code: 'TURB', description: 'Turbines à gaz', icon: 'zap' } }),
      db.equipmentCategory.create({ data: { name: 'Générateurs', code: 'GEN', description: 'Groupes électrogènes', icon: 'battery-charging' } }),
      db.equipmentCategory.create({ data: { name: 'Vannes', code: 'VANN', description: 'Vannes et robinetterie', icon: 'settings' } }),
      db.equipmentCategory.create({ data: { name: 'Capteurs', code: 'CAPT', description: 'Capteurs et instruments de mesure', icon: 'activity' } }),
      db.equipmentCategory.create({ data: { name: 'Systèmes électriques', code: 'ELEC', description: 'Installations et équipements électriques', icon: 'plug' } }),
    ]);

    const [catPipelines, catCompresseurs, catTurbines, catGenerateurs, catVannes, catCapteurs, catElectriques] = categories;

    // ============================================================
    // 4. EQUIPMENT
    // ============================================================
    const equipment = await Promise.all([
      db.equipment.create({ data: { name: 'Compresseur Atlas Copco GA90+', code: 'EQ-001', serialNumber: 'AC-2021-4521', categoryId: catCompresseurs.id, siteId: conakry.id, manufacturer: 'Atlas Copco', model: 'GA90+', year: 2021, criticality: 'CRITIQUE', status: 'OPERATIONNEL', purchaseDate: new Date('2021-03-15'), installationDate: new Date('2021-06-20'), warrantyEnd: new Date('2024-03-15'), expectedLifespan: 240, currentHealthScore: 87, description: 'Compresseur principal station Conakry Central' } }),
      db.equipment.create({ data: { name: 'Turbine Siemens SGT-400', code: 'EQ-002', serialNumber: 'SI-2019-8832', categoryId: catTurbines.id, siteId: kamsar.id, manufacturer: 'Siemens', model: 'SGT-400', year: 2019, criticality: 'CRITIQUE', status: 'OPERATIONNEL', purchaseDate: new Date('2019-01-10'), installationDate: new Date('2019-08-15'), warrantyEnd: new Date('2023-01-10'), expectedLifespan: 360, currentHealthScore: 72, description: 'Turbine à gaz de production Kamsar' } }),
      db.equipment.create({ data: { name: 'Pipeline Conakry-Kamsar DN300', code: 'EQ-003', serialNumber: 'PL-2018-0012', categoryId: catPipelines.id, siteId: conakry.id, manufacturer: 'Vallourec', model: 'DN300-L360', year: 2018, criticality: 'CRITIQUE', status: 'OPERATIONNEL', installationDate: new Date('2018-12-01'), expectedLifespan: 600, currentHealthScore: 91, description: 'Pipeline principal reliant Conakry à Kamsar' } }),
      db.equipment.create({ data: { name: 'Générateur Caterpillar C18', code: 'EQ-004', serialNumber: 'CAT-2022-3345', categoryId: catGenerateurs.id, siteId: boke.id, manufacturer: 'Caterpillar', model: 'C18', year: 2022, criticality: 'IMPORTANTE', status: 'OPERATIONNEL', purchaseDate: new Date('2022-05-01'), installationDate: new Date('2022-07-10'), warrantyEnd: new Date('2025-05-01'), expectedLifespan: 180, currentHealthScore: 95, description: 'Groupe électrogène de secours Boké' } }),
      db.equipment.create({ data: { name: 'Vanne motorisée Fisher ET', code: 'EQ-005', serialNumber: 'FI-2020-5678', categoryId: catVannes.id, siteId: conakry.id, manufacturer: 'Emerson Fisher', model: 'ET', year: 2020, criticality: 'IMPORTANTE', status: 'OPERATIONNEL', purchaseDate: new Date('2020-09-20'), warrantyEnd: new Date('2023-09-20'), expectedLifespan: 120, currentHealthScore: 68, description: 'Vanne de régulation débit station Conakry' } }),
      db.equipment.create({ data: { name: 'Capteur pression Rosemount 3051', code: 'EQ-006', serialNumber: 'RS-2023-1234', categoryId: catCapteurs.id, siteId: kamsar.id, manufacturer: 'Emerson Rosemount', model: '3051C', year: 2023, criticality: 'MOYENNE', status: 'OPERATIONNEL', purchaseDate: new Date('2023-02-15'), warrantyEnd: new Date('2026-02-15'), expectedLifespan: 84, currentHealthScore: 98, description: 'Capteur de pression différentielle Kamsar' } }),
      db.equipment.create({ data: { name: 'Compresseur Ariel JGK/4', code: 'EQ-007', serialNumber: 'AR-2020-9876', categoryId: catCompresseurs.id, siteId: kamsar.id, manufacturer: 'Ariel Corporation', model: 'JGK/4', year: 2020, criticality: 'CRITIQUE', status: 'EN_MAINTENANCE', purchaseDate: new Date('2020-04-10'), installationDate: new Date('2020-08-25'), warrantyEnd: new Date('2023-04-10'), expectedLifespan: 240, currentHealthScore: 45, description: 'Compresseur de processus Kamsar - en maintenance programmée' } }),
      db.equipment.create({ data: { name: 'Armoire électrique ABB ACS880', code: 'EQ-008', serialNumber: 'ABB-2021-7654', categoryId: catElectriques.id, siteId: conakry.id, manufacturer: 'ABB', model: 'ACS880', year: 2021, criticality: 'IMPORTANTE', status: 'OPERATIONNEL', purchaseDate: new Date('2021-11-01'), warrantyEnd: new Date('2024-11-01'), expectedLifespan: 180, currentHealthScore: 82, description: 'Variateur de vitesse principal Conakry' } }),
      db.equipment.create({ data: { name: 'Turbine Solar Titan 130', code: 'EQ-009', serialNumber: 'SL-2017-4321', categoryId: catTurbines.id, siteId: kamsar.id, manufacturer: 'Solar Turbines', model: 'Titan 130', year: 2017, criticality: 'CRITIQUE', status: 'EN_PANNE', purchaseDate: new Date('2017-06-15'), installationDate: new Date('2017-11-20'), expectedLifespan: 360, currentHealthScore: 15, description: 'Turbine en panne - arrêt d\'urgence détecté' } }),
      db.equipment.create({ data: { name: 'Vanne de sécurité Crosby JOS-E', code: 'EQ-010', serialNumber: 'CR-2022-8765', categoryId: catVannes.id, siteId: kindia.id, manufacturer: 'Crosby', model: 'JOS-E', year: 2022, criticality: 'IMPORTANTE', status: 'OPERATIONNEL', purchaseDate: new Date('2022-03-01'), warrantyEnd: new Date('2025-03-01'), expectedLifespan: 120, currentHealthScore: 90, description: 'Soupape de décharge Kindia Stockage' } }),
      db.equipment.create({ data: { name: 'Générateur Cummins QST30-G3', code: 'EQ-011', serialNumber: 'CM-2023-2468', categoryId: catGenerateurs.id, siteId: nzerekore.id, manufacturer: 'Cummins', model: 'QST30-G3', year: 2023, criticality: 'MOYENNE', status: 'OPERATIONNEL', purchaseDate: new Date('2023-07-20'), warrantyEnd: new Date('2026-07-20'), expectedLifespan: 180, currentHealthScore: 100, description: 'Générateur station Nzérékoré' } }),
      db.equipment.create({ data: { name: 'Pipeline Boké-Kindia DN200', code: 'EQ-012', serialNumber: 'PL-2020-0045', categoryId: catPipelines.id, siteId: boke.id, manufacturer: 'Tenaris', model: 'DN200-X70', year: 2020, criticality: 'CRITIQUE', status: 'OPERATIONNEL', installationDate: new Date('2020-09-15'), expectedLifespan: 600, currentHealthScore: 85, description: 'Pipeline secondaire Boké-Kindia' } }),
      db.equipment.create({ data: { name: 'Débitmètre Endress+Hauser Promag', code: 'EQ-013', serialNumber: 'EH-2022-1357', categoryId: catCapteurs.id, siteId: conakry.id, manufacturer: 'Endress+Hauser', model: 'Promag P 10', year: 2022, criticality: 'MOYENNE', status: 'OPERATIONNEL', purchaseDate: new Date('2022-08-10'), warrantyEnd: new Date('2025-08-10'), expectedLifespan: 84, currentHealthScore: 93, description: 'Débitmètre électromagnétique station Conakry' } }),
      db.equipment.create({ data: { name: 'Compresseur Burckhardt CBO', code: 'EQ-014', serialNumber: 'BC-2019-9753', categoryId: catCompresseurs.id, siteId: kindia.id, manufacturer: 'Burckhardt Compression', model: 'CBO', year: 2019, criticality: 'IMPORTANTE', status: 'HORS_SERVICE', purchaseDate: new Date('2019-12-01'), expectedLifespan: 240, currentHealthScore: 5, description: 'Compresseur hors service - mis au rebut planifié' } }),
      db.equipment.create({ data: { name: 'Analyseur gaz ABB AO2000', code: 'EQ-015', serialNumber: 'ABB-2023-8642', categoryId: catCapteurs.id, siteId: kamsar.id, manufacturer: 'ABB', model: 'AO2000', year: 2023, criticality: 'MOYENNE', status: 'OPERATIONNEL', purchaseDate: new Date('2023-01-20'), warrantyEnd: new Date('2026-01-20'), expectedLifespan: 84, currentHealthScore: 96, description: 'Analyseur de qualité du gaz Kamsar' } }),
    ]);

    // ============================================================
    // 5. WORK ORDERS
    // ============================================================
    const workOrders = [];
    const woData = [
      { title: 'Remplacement roulement compresseur GA90+', type: 'CORRECTIVE', status: 'EN_COURS', priority: 'P2_HAUTE', equipmentIdx: 0, siteIdx: 0, assignedToIdx: 4, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-01-15', plannedEndDate: '2024-01-17', estimatedHours: 16 },
      { title: 'Inspection turbine SGT-400 5000h', type: 'PREVENTIVE', status: 'PLANIFIEE', priority: 'P2_HAUTE', equipmentIdx: 1, siteIdx: 1, assignedToIdx: 5, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-02-01', plannedEndDate: '2024-02-05', estimatedHours: 40 },
      { title: 'Réparation fuite vanne Fisher ET', type: 'CORRECTIVE', status: 'EN_ATTENTE', priority: 'P3_MOYENNE', equipmentIdx: 4, siteIdx: 0, assignedToIdx: null, requestedByIdx: 4, supervisorIdx: null, plannedStartDate: '2024-01-20', estimatedHours: 4 },
      { title: 'Calibration capteurs pression Kamsar', type: 'PREVENTIVE', status: 'TERMINEE', priority: 'P4_BASSE', equipmentIdx: 5, siteIdx: 1, assignedToIdx: 5, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-01-05', plannedEndDate: '2024-01-05', actualStartDate: '2024-01-05', actualEndDate: '2024-01-05', estimatedHours: 3, actualHours: 2.5 },
      { title: 'Remplacement joint compresseur Ariel', type: 'CORRECTIVE', status: 'EN_COURS', priority: 'P1_CRITIQUE', equipmentIdx: 6, siteIdx: 1, assignedToIdx: 5, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-01-10', plannedEndDate: '2024-01-12', estimatedHours: 24 },
      { title: 'Diagnostic armoire électrique ABB', type: 'CORRECTIVE', status: 'SUSPENDUE', priority: 'P3_MOYENNE', equipmentIdx: 7, siteIdx: 0, assignedToIdx: 4, requestedByIdx: 4, supervisorIdx: 2, plannedStartDate: '2024-01-12', estimatedHours: 6 },
      { title: 'Intervention d\'urgence turbine Titan 130', type: 'URGENTE', status: 'CRITIQUE', priority: 'P1_CRITIQUE', equipmentIdx: 8, siteIdx: 1, assignedToIdx: 5, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-01-08', estimatedHours: 48 },
      { title: 'Maintenance préventive générateur C18', type: 'PREVENTIVE', status: 'PLANIFIEE', priority: 'P3_MOYENNE', equipmentIdx: 3, siteIdx: 2, assignedToIdx: 6, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-02-15', plannedEndDate: '2024-02-16', estimatedHours: 8 },
      { title: 'Test soupape Crosby JOS-E', type: 'PREVENTIVE', status: 'VALIDEE', priority: 'P3_MOYENNE', equipmentIdx: 9, siteIdx: 4, assignedToIdx: 4, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-01-03', plannedEndDate: '2024-01-03', actualStartDate: '2024-01-03', actualEndDate: '2024-01-03', estimatedHours: 2, actualHours: 1.5 },
      { title: 'Installation débitmètre Promag supplémentaire', type: 'AMELIORATIVE', status: 'EN_ATTENTE', priority: 'P4_BASSE', equipmentIdx: 12, siteIdx: 0, assignedToIdx: null, requestedByIdx: 1, supervisorIdx: null, plannedStartDate: '2024-03-01', estimatedHours: 8 },
      { title: 'Inspection pipeline Conakry-Kamsar', type: 'PREVENTIVE', status: 'PLANIFIEE', priority: 'P1_CRITIQUE', equipmentIdx: 2, siteIdx: 0, assignedToIdx: 4, requestedByIdx: 2, supervisorIdx: 2, plannedStartDate: '2024-02-20', plannedEndDate: '2024-03-05', estimatedHours: 80 },
      { title: 'Remplacement compresseur Burckhardt CBO', type: 'AMELIORATIVE', status: 'EN_ATTENTE', priority: 'P2_HAUTE', equipmentIdx: 13, siteIdx: 4, assignedToIdx: null, requestedByIdx: 2, supervisorIdx: null, plannedStartDate: '2024-04-01', estimatedHours: 120 },
    ];

    for (let i = 0; i < woData.length; i++) {
      const d = woData[i];
      const code = `OT-${String(i + 1).padStart(5, '0')}`;
      const wo = await db.workOrder.create({
        data: {
          code,
          title: d.title,
          description: `Ordre de travail: ${d.title}`,
          type: d.type,
          status: d.status,
          priority: d.priority,
          equipmentId: equipment[d.equipmentIdx].id,
          siteId: sites[d.siteIdx].id,
          assignedToId: d.assignedToIdx !== null ? users[d.assignedToIdx].id : null,
          requestedById: d.requestedByIdx !== null ? users[d.requestedByIdx].id : null,
          supervisorId: d.supervisorIdx !== null ? users[d.supervisorIdx].id : null,
          plannedStartDate: d.plannedStartDate ? new Date(d.plannedStartDate) : undefined,
          plannedEndDate: d.plannedEndDate ? new Date(d.plannedEndDate) : undefined,
          actualStartDate: d.actualStartDate ? new Date(d.actualStartDate) : undefined,
          actualEndDate: d.actualEndDate ? new Date(d.actualEndDate) : undefined,
          estimatedHours: d.estimatedHours,
          actualHours: d.actualHours,
        },
      });
      workOrders.push(wo);
    }

    // ============================================================
    // 6. INCIDENTS
    // ============================================================
    const incidents = [];
    const incidentData = [
      { title: 'Fuite de gaz détectée sur vanne Fisher', severity: 'CRITIQUE', status: 'EN_COURS', equipmentIdx: 4, siteIdx: 0, reportedByIdx: 4, rootCause: 'Usure du joint d\'étanchéité', correctiveAction: 'Remplacement du joint et resserage' },
      { title: 'Vibrations anormales compresseur Ariel', severity: 'MAJEURE', status: 'RESOLU', equipmentIdx: 6, siteIdx: 1, reportedByIdx: 5, rootCause: 'Déséquilibre du rotor', correctiveAction: 'Équilibrage dynamique effectué' },
      { title: 'Arrêt d\'urgence turbine Titan 130', severity: 'CRITIQUE', status: 'OUVERT', equipmentIdx: 8, siteIdx: 1, reportedByIdx: 5, rootCause: 'En cours d\'investigation' },
      { title: 'Défaillance capteur température', severity: 'MINEURE', status: 'CLOTURE', equipmentIdx: 5, siteIdx: 1, reportedByIdx: 5, rootCause: 'Dérive du capteur PT100', correctiveAction: 'Remplacement du capteur' },
      { title: 'Surtension armoire ABB', severity: 'MAJEURE', status: 'EN_COURS', equipmentIdx: 7, siteIdx: 0, reportedByIdx: 4, rootCause: 'Défaut parafoudre' },
      { title: 'Corrosion pipeline DN200 tronçon Boké', severity: 'MAJEURE', status: 'OUVERT', equipmentIdx: 11, siteIdx: 2, reportedByIdx: 6 },
      { title: 'Lecture erratique débitmètre Conakry', severity: 'MINEURE', status: 'RESOLU', equipmentIdx: 12, siteIdx: 0, reportedByIdx: 4, rootCause: 'Encrassement électrodes', correctiveAction: 'Nettoyage électrodes effectué' },
    ];

    for (let i = 0; i < incidentData.length; i++) {
      const d = incidentData[i];
      const code = `INC-${String(i + 1).padStart(5, '0')}`;
      const inc = await db.incident.create({
        data: {
          code,
          title: d.title,
          description: `Incident: ${d.title}`,
          equipmentId: equipment[d.equipmentIdx].id,
          siteId: sites[d.siteIdx].id,
          reportedById: users[d.reportedByIdx].id,
          severity: d.severity,
          status: d.status,
          rootCause: d.rootCause,
          correctiveAction: d.correctiveAction,
          detectedAt: new Date(2024, 0, 8 + i),
          resolvedAt: d.status === 'RESOLU' || d.status === 'CLOTURE' ? new Date(2024, 0, 12 + i) : undefined,
        },
      });
      incidents.push(inc);
    }

    // ============================================================
    // 7. MAINTENANCE PLANS
    // ============================================================
    const maintenancePlans = [];
    const mpData = [
      { name: 'Maintenance compresseur GA90+ mensuelle', equipmentIdx: 0, type: 'PERIODIQUE', frequency: 'MOIS', frequencyValue: 1, nextDueDate: '2024-02-15', estimatedDuration: 240, tasks: ['Vérification niveau huile', 'Contrôle courroies', 'Test sécurité', 'Nettoyage filtres air'] },
      { name: 'Inspection turbine SGT-400 trimestrielle', equipmentIdx: 1, type: 'PERIODIQUE', frequency: 'TRIMESTRE', frequencyValue: 1, nextDueDate: '2024-03-01', estimatedDuration: 480, tasks: ['Analyse vibratoire', 'Contrôle température paliers', 'Inspection aubes', 'Test régulation'] },
      { name: 'Surveillance pipeline conditionnelle', equipmentIdx: 2, type: 'CONDITIONNELLE', frequency: 'MOIS', frequencyValue: 3, nextDueDate: '2024-02-01', estimatedDuration: 960, tasks: ['Inspection visuelle tronçons', 'Mesure épaisseur par ultrasons', 'Test pression', 'Vérification cathodique'] },
      { name: 'Entretien générateur C18 semestriel', equipmentIdx: 3, type: 'PERIODIQUE', frequency: 'SEMESTRE', frequencyValue: 1, nextDueDate: '2024-06-01', estimatedDuration: 480, tasks: ['Vidange huile moteur', 'Remplacement filtres', 'Test charge', 'Contrôle circuit refroidissement'] },
      { name: 'Calibration capteurs annuelle', equipmentIdx: 5, type: 'PERIODIQUE', frequency: 'ANNUEL', frequencyValue: 1, nextDueDate: '2024-01-15', estimatedDuration: 120, tasks: ['Vérification étalonnage', 'Test linéarité', 'Recalibration'] },
    ];

    for (let i = 0; i < mpData.length; i++) {
      const d = mpData[i];
      const code = `MP-${String(i + 1).padStart(5, '0')}`;
      const mp = await db.maintenancePlan.create({
        data: {
          code,
          name: d.name,
          equipmentId: equipment[d.equipmentIdx].id,
          type: d.type,
          frequency: d.frequency,
          frequencyValue: d.frequencyValue,
          nextDueDate: new Date(d.nextDueDate),
          isActive: true,
          estimatedDuration: d.estimatedDuration,
          tasks: {
            create: d.tasks.map((task: string, idx: number) => ({
              description: task,
              order: idx,
              isRequired: true,
            })),
          },
        },
      });
      maintenancePlans.push(mp);
    }

    // ============================================================
    // 8. PART CATEGORIES & PARTS
    // ============================================================
    const partCategories = await Promise.all([
      db.partCategory.create({ data: { name: 'Roulements', code: 'ROUL', description: 'Roulements et paliers' } }),
      db.partCategory.create({ data: { name: 'Joints', code: 'JOINT', description: 'Joints d\'étanchéité' } }),
      db.partCategory.create({ data: { name: 'Filtres', code: 'FILT', description: 'Filtres et séparateurs' } }),
      db.partCategory.create({ data: { name: 'Huiles', code: 'HUIL', description: 'Lubrifiants et huiles' } }),
      db.partCategory.create({ data: { name: 'Électricité', code: 'ELEC', description: 'Composants électriques' } }),
      db.partCategory.create({ data: { name: 'Capteurs', code: 'CAPT-P', description: 'Pièces de rechange capteurs' } }),
      db.partCategory.create({ data: { name: 'Vannes', code: 'VANN-P', description: 'Pièces de vannes' } }),
    ]);

    const [catRoulements, catJoints, catFiltres, catHuiles, catElec, catCapteursP, catVannesP] = partCategories;

    const parts = await Promise.all([
      db.part.create({ data: { name: 'Roulement SKF 6316-2RS1', code: 'P-001', categoryId: catRoulements.id, manufacturer: 'SKF', partNumber: '6316-2RS1', unit: 'unite', unitPrice: 285000, minStockLevel: 4, maxStockLevel: 12, currentStock: 8, reorderPoint: 4, leadTimeDays: 30, isActive: true } }),
      db.part.create({ data: { name: 'Joint torique Viton 150mm', code: 'P-002', categoryId: catJoints.id, manufacturer: 'Parker', partNumber: '2-150-V88', unit: 'unite', unitPrice: 45000, minStockLevel: 10, maxStockLevel: 50, currentStock: 25, reorderPoint: 10, leadTimeDays: 14, isActive: true } }),
      db.part.create({ data: { name: 'Filtre à air Atlas Copco 1613-7407-00', code: 'P-003', categoryId: catFiltres.id, manufacturer: 'Atlas Copco', partNumber: '1613-7407-00', unit: 'unite', unitPrice: 175000, minStockLevel: 6, maxStockLevel: 20, currentStock: 3, reorderPoint: 6, leadTimeDays: 21, isActive: true } }),
      db.part.create({ data: { name: 'Huile compresseur Shell Corena S4 P100', code: 'P-004', categoryId: catHuiles.id, manufacturer: 'Shell', partNumber: 'Corena-S4-P100', unit: 'litre', unitPrice: 35000, minStockLevel: 40, maxStockLevel: 200, currentStock: 85, reorderPoint: 40, leadTimeDays: 10, isActive: true } }),
      db.part.create({ data: { name: 'Fusible 63A gG', code: 'P-005', categoryId: catElec.id, manufacturer: 'Siemens', partNumber: '5SD7063', unit: 'unite', unitPrice: 15000, minStockLevel: 10, maxStockLevel: 30, currentStock: 18, reorderPoint: 10, leadTimeDays: 7, isActive: true } }),
      db.part.create({ data: { name: 'Capteur PT100 Classe A', code: 'P-006', categoryId: catCapteursP.id, manufacturer: 'Endress+Hauser', partNumber: 'TR10-A', unit: 'unite', unitPrice: 520000, minStockLevel: 2, maxStockLevel: 8, currentStock: 4, reorderPoint: 2, leadTimeDays: 45, isActive: true } }),
      db.part.create({ data: { name: 'Joint plat cuivre DN50', code: 'P-007', categoryId: catJoints.id, manufacturer: 'Generique', partNumber: 'JPC-DN50', unit: 'unite', unitPrice: 12000, minStockLevel: 15, maxStockLevel: 50, currentStock: 32, reorderPoint: 15, leadTimeDays: 7, isActive: true } }),
      db.part.create({ data: { name: 'Courroie trapézoïdale SPB 2360', code: 'P-008', categoryId: catRoulements.id, manufacturer: 'Gates', partNumber: 'SPB2360', unit: 'unite', unitPrice: 95000, minStockLevel: 4, maxStockLevel: 10, currentStock: 2, reorderPoint: 4, leadTimeDays: 14, isActive: true } }),
      db.part.create({ data: { name: 'Kit réparation vanne Fisher', code: 'P-009', categoryId: catVannesP.id, manufacturer: 'Emerson Fisher', partNumber: 'ET-REPKIT', unit: 'kit', unitPrice: 1850000, minStockLevel: 1, maxStockLevel: 4, currentStock: 1, reorderPoint: 1, leadTimeDays: 60, isActive: true } }),
      db.part.create({ data: { name: 'Filtre séparateur coalescent', code: 'P-010', categoryId: catFiltres.id, manufacturer: 'Atlas Copco', partNumber: '1613-8428-00', unit: 'unite', unitPrice: 320000, minStockLevel: 4, maxStockLevel: 12, currentStock: 0, reorderPoint: 4, leadTimeDays: 30, isActive: true } }),
    ]);

    // ============================================================
    // 9. WAREHOUSES
    // ============================================================
    const warehouses = await Promise.all([
      db.warehouse.create({ data: { name: 'Magasin Central Conakry', code: 'WH-CKY-001', siteId: conakry.id, type: 'CENTRAL', address: 'Almamya, Dépôt SIGG', managerId: respStock.id, isActive: true } }),
      db.warehouse.create({ data: { name: 'Magasin Production Kamsar', code: 'WH-KMR-001', siteId: kamsar.id, type: 'SECONDAIRE', address: 'Zone Industrielle Kamsar', isActive: true } }),
      db.warehouse.create({ data: { name: 'Magasin Boké', code: 'WH-BKE-001', siteId: boke.id, type: 'SECONDAIRE', address: 'Centre Ville Boké', isActive: true } }),
      db.warehouse.create({ data: { name: 'Magasin Kindia', code: 'WH-KND-001', siteId: kindia.id, type: 'SECONDAIRE', address: 'Zone Artisanale Kindia', isActive: true } }),
    ]);

    // Create warehouse stock
    for (const wh of warehouses) {
      // Add some parts to each warehouse
      for (let i = 0; i < 5; i++) {
        try {
          await db.warehouseStock.create({
            data: {
              warehouseId: wh.id,
              partId: parts[i].id,
              quantity: Math.floor(Math.random() * 20) + 2,
              minLevel: 2,
              maxLevel: 30,
              location: `A-${i + 1}-0${Math.floor(Math.random() * 3) + 1}`,
            },
          });
        } catch (e) {
          // Skip if duplicate
        }
      }
    }

    // ============================================================
    // 10. SUPPLIERS
    // ============================================================
    const suppliers = await Promise.all([
      db.supplier.create({ data: { name: 'Atlas Copco Guinée', code: 'SUP-001', contactName: 'Philippe Martin', email: 'philippe.martin@atlas-copco.gn', phone: '+224 620 11 11 01', address: 'Zone Industrielle Conakry', city: 'Conakry', country: 'Guinée', isActive: true, rating: 5 } }),
      db.supplier.create({ data: { name: 'Siemens Energy Guinée', code: 'SUP-002', contactName: 'Hans Müller', email: 'hans.muller@siemens.com', phone: '+224 620 11 11 02', address: 'Kaloum, Conakry', city: 'Conakry', country: 'Guinée', isActive: true, rating: 4 } }),
      db.supplier.create({ data: { name: 'Emerson Process Management', code: 'SUP-003', contactName: 'Pierre Leclerc', email: 'pierre.leclerc@emerson.com', phone: '+224 620 11 11 03', city: 'Conakry', country: 'Guinée', isActive: true, rating: 4 } }),
      db.supplier.create({ data: { name: 'SKF Guinée SARL', code: 'SUP-004', contactName: 'Moussa Keita', email: 'moussa.keita@skf.gn', phone: '+224 620 11 11 04', city: 'Conakry', country: 'Guinée', isActive: true, rating: 3 } }),
      db.supplier.create({ data: { name: 'Shell Lubrifiants Guinée', code: 'SUP-005', contactName: 'Alpha Diallo', email: 'alpha.diallo@shell.gn', phone: '+224 620 11 11 05', city: 'Conakry', country: 'Guinée', isActive: true, rating: 5 } }),
    ]);

    // ============================================================
    // 11. PURCHASE ORDERS
    // ============================================================
    const po1 = await db.purchaseOrder.create({
      data: {
        code: 'PO-00001',
        supplierId: suppliers[0].id,
        status: 'APPROUVEE',
        totalAmount: 285000 * 4 + 175000 * 6,
        currency: 'GNF',
        requestedById: respStock.id,
        approvedById: respMaint.id,
        orderDate: new Date('2024-01-05'),
        expectedDeliveryDate: new Date('2024-02-05'),
        notes: 'Commande pièces compresseur GA90+',
        items: {
          create: [
            { partId: parts[0].id, quantity: 4, unitPrice: 285000, totalPrice: 285000 * 4, receivedQuantity: 0 },
            { partId: parts[2].id, quantity: 6, unitPrice: 175000, totalPrice: 175000 * 6, receivedQuantity: 0 },
          ],
        },
      },
    });

    const po2 = await db.purchaseOrder.create({
      data: {
        code: 'PO-00002',
        supplierId: suppliers[4].id,
        status: 'LIVREE',
        totalAmount: 35000 * 40,
        currency: 'GNF',
        requestedById: respStock.id,
        approvedById: admin.id,
        orderDate: new Date('2023-12-15'),
        expectedDeliveryDate: new Date('2024-01-15'),
        items: {
          create: [
            { partId: parts[3].id, quantity: 40, unitPrice: 35000, totalPrice: 35000 * 40, receivedQuantity: 40 },
          ],
        },
      },
    });

    // ============================================================
    // 12. STOCK MOVEMENTS
    // ============================================================
    const stockMovements = [];
    const movementData = [
      { partIdx: 3, warehouseIdx: 0, type: 'ENTREE', quantity: 40, performedByIdx: 3, notes: 'Réception commande PO-00002', reference: 'PO-00002' },
      { partIdx: 0, warehouseIdx: 0, type: 'SORTIE', quantity: 2, performedByIdx: 3, notes: 'Prélèvement pour OT-00001', workOrderIdx: 0 },
      { partIdx: 2, warehouseIdx: 0, type: 'SORTIE', quantity: 1, performedByIdx: 3, notes: 'Remplacement filtre compresseur' },
      { partIdx: 8, warehouseIdx: 0, type: 'SORTIE', quantity: 1, performedByIdx: 4, notes: 'Kit réparation vanne Fisher', workOrderIdx: 2 },
      { partIdx: 1, warehouseIdx: 1, type: 'ENTREE', quantity: 50, performedByIdx: 3, notes: 'Réapprovisionnement joints' },
      { partIdx: 7, warehouseIdx: 1, type: 'SORTIE', quantity: 2, performedByIdx: 5, notes: 'Remplacement courroie compresseur Ariel', workOrderIdx: 4 },
    ];

    for (const d of movementData) {
      const sm = await db.stockMovement.create({
        data: {
          partId: parts[d.partIdx].id,
          warehouseId: warehouses[d.warehouseIdx].id,
          type: d.type,
          quantity: d.quantity,
          reference: d.reference,
          workOrderId: d.workOrderIdx !== undefined ? workOrders[d.workOrderIdx].id : undefined,
          performedById: users[d.performedByIdx].id,
          notes: d.notes,
        },
      });
      stockMovements.push(sm);
    }

    // ============================================================
    // 13. MAINTENANCE COSTS
    // ============================================================
    const costData = [
      { type: 'MAIN_DOEUVRE', amount: 850000, siteIdx: 0, description: 'Main d\'œuvre intervention OT-00001', workOrderIdx: 0, equipmentIdx: 0, date: '2024-01-16' },
      { type: 'PIECES', amount: 285000 * 2, siteIdx: 0, description: 'Roulements SKF pour compresseur GA90+', workOrderIdx: 0, equipmentIdx: 0, date: '2024-01-16' },
      { type: 'OUTILLAGE', amount: 350000, siteIdx: 1, description: 'Location outillage spécialisé turbine', workOrderIdx: 1, equipmentIdx: 1, date: '2024-01-20' },
      { type: 'SOUS_TRAITANCE', amount: 5500000, siteIdx: 1, description: 'Sous-traitant Siemens diagnostic turbine', workOrderIdx: 6, equipmentIdx: 8, date: '2024-01-09' },
      { type: 'PIECES', amount: 1850000, siteIdx: 0, description: 'Kit réparation vanne Fisher', workOrderIdx: 2, equipmentIdx: 4, date: '2024-01-18' },
      { type: 'MAIN_DOEUVRE', amount: 450000, siteIdx: 1, description: 'Technicien calibration capteurs', workOrderIdx: 3, equipmentIdx: 5, date: '2024-01-05' },
      { type: 'AUTRE', amount: 150000, siteIdx: 0, description: 'Transport pièces Conakry', date: '2024-01-12' },
      { type: 'MAIN_DOEUVRE', amount: 1200000, siteIdx: 1, description: 'Équipe intervention d\'urgence turbine', workOrderIdx: 6, equipmentIdx: 8, date: '2024-01-10' },
      { type: 'PIECES', amount: 95000 * 2, siteIdx: 1, description: 'Courroies Gates compresseur Ariel', workOrderIdx: 4, equipmentIdx: 6, date: '2024-01-11' },
    ];

    for (const d of costData) {
      await db.maintenanceCost.create({
        data: {
          type: d.type,
          amount: d.amount,
          siteId: sites[d.siteIdx].id,
          description: d.description,
          workOrderId: d.workOrderIdx !== undefined ? workOrders[d.workOrderIdx].id : undefined,
          equipmentId: d.equipmentIdx !== undefined ? equipment[d.equipmentIdx].id : undefined,
          date: new Date(d.date),
          currency: 'GNF',
        },
      });
    }

    // ============================================================
    // 14. COST CENTERS
    // ============================================================
    const costCenters = await Promise.all([
      db.costCenter.create({ data: { name: 'Maintenance Conakry Central', code: 'CC-CKY-001', siteId: conakry.id, budget: 50000000, spent: 3395000, remaining: 46605000, period: '2024' } }),
      db.costCenter.create({ data: { name: 'Maintenance Kamsar Production', code: 'CC-KMR-001', siteId: kamsar.id, budget: 80000000, spent: 7790000, remaining: 72210000, period: '2024' } }),
      db.costCenter.create({ data: { name: 'Maintenance Boké Distribution', code: 'CC-BKE-001', siteId: boke.id, budget: 25000000, spent: 0, remaining: 25000000, period: '2024' } }),
      db.costCenter.create({ data: { name: 'Logistique Globale', code: 'CC-LOG-001', siteId: conakry.id, budget: 30000000, spent: 150000, remaining: 29850000, period: '2024' } }),
    ]);

    // ============================================================
    // 15. KPI RECORDS
    // ============================================================
    const kpiMetrics = ['MTTR', 'MTBF', 'DISPONIBILITE', 'TAUX_PANNE', 'TAUX_CONFORMITE', 'COUT_MOYEN_PANNE'];
    const kpiUnits: Record<string, string> = { MTTR: 'heures', MTBF: 'heures', DISPONIBILITE: '%', TAUX_PANNE: '%', TAUX_CONFORMITE: '%', COUT_MOYEN_PANNE: 'GNF' };
    const kpiBaseValues: Record<string, number> = { MTTR: 4.5, MTBF: 720, DISPONIBILITE: 87.5, TAUX_PANNE: 3.2, TAUX_CONFORMITE: 94.1, COUT_MOYEN_PANNE: 850000 };

    for (const site of sites) {
      for (const metric of kpiMetrics) {
        for (let month = 1; month <= 3; month++) {
          const variation = (Math.random() - 0.5) * 0.2;
          await db.kPIRecord.create({
            data: {
              siteId: site.id,
              metric,
              value: Math.round(kpiBaseValues[metric] * (1 + variation) * 100) / 100,
              unit: kpiUnits[metric],
              period: `2024-${String(month).padStart(2, '0')}`,
              recordedAt: new Date(2024, month - 1, 28),
            },
          });
        }
      }
    }

    // ============================================================
    // 16. NOTIFICATIONS
    // ============================================================
    const notificationData = [
      { userIdx: 4, title: 'Ordre de travail assigné', message: 'Vous avez été assigné à l\'OT-00001: Remplacement roulement compresseur GA90+', type: 'IN_APP', relatedEntity: 'WorkOrder', relatedEntityId: workOrders[0]?.id },
      { userIdx: 5, title: 'Intervention urgente requise', message: 'La turbine Titan 130 est en arrêt d\'urgence. Intervention critique requise.', type: 'IN_APP', relatedEntity: 'WorkOrder', relatedEntityId: workOrders[6]?.id },
      { userIdx: 2, title: 'Plan de maintenance échue', message: 'Le plan de maintenance MP-00005 (Calibration capteurs) est arrivé à échéance.', type: 'IN_APP', relatedEntity: 'MaintenancePlan', relatedEntityId: maintenancePlans[4]?.id },
      { userIdx: 3, title: 'Stock faible détecté', message: 'Le filtre à air Atlas Copco (P-003) est en dessous du niveau minimum.', type: 'IN_APP', relatedEntity: 'Part', relatedEntityId: parts[2]?.id },
      { userIdx: 0, title: 'Incident critique signalé', message: 'Un incident critique a été signalé sur la vanne Fisher à Conakry Central.', type: 'IN_APP', relatedEntity: 'Incident', relatedEntityId: incidents[0]?.id },
      { userIdx: 4, title: 'Ordre de travail terminé', message: 'L\'OT-00004 (Calibration capteurs pression) a été marqué comme terminé.', type: 'IN_APP', relatedEntity: 'WorkOrder', relatedEntityId: workOrders[3]?.id },
      { userIdx: 8, title: 'Dépassement budget', message: 'Le centre de coûts Kamsar approche 10% du budget annuel.', type: 'IN_APP' },
    ];

    for (const d of notificationData) {
      await db.notification.create({
        data: {
          userId: users[d.userIdx].id,
          title: d.title,
          message: d.message,
          type: d.type,
          relatedEntity: d.relatedEntity,
          relatedEntityId: d.relatedEntityId,
          isRead: Math.random() > 0.6,
        },
      });
    }

    // ============================================================
    // 17. EQUIPMENT PARAMETERS
    // ============================================================
    const paramData = [
      { equipmentIdx: 0, name: 'Pression sortie', value: '7.5', unit: 'bar', minThreshold: '6.0', maxThreshold: '8.5' },
      { equipmentIdx: 0, name: 'Température huile', value: '68', unit: '°C', minThreshold: '40', maxThreshold: '85' },
      { equipmentIdx: 0, name: 'Vibrations', value: '2.3', unit: 'mm/s', minThreshold: '0', maxThreshold: '4.5' },
      { equipmentIdx: 1, name: 'Vitesse rotation', value: '14800', unit: 'RPM', minThreshold: '14000', maxThreshold: '16000' },
      { equipmentIdx: 1, name: 'Température échappement', value: '485', unit: '°C', minThreshold: '350', maxThreshold: '540' },
      { equipmentIdx: 6, name: 'Pression aspiration', value: '3.2', unit: 'bar', minThreshold: '2.5', maxThreshold: '4.0' },
      { equipmentIdx: 8, name: 'Température paliers', value: '125', unit: '°C', minThreshold: '40', maxThreshold: '90' },
    ];

    for (const d of paramData) {
      await db.equipmentParameter.create({
        data: {
          equipmentId: equipment[d.equipmentIdx].id,
          name: d.name,
          value: d.value,
          unit: d.unit,
          minThreshold: d.minThreshold,
          maxThreshold: d.maxThreshold,
          lastChecked: new Date(),
        },
      });
    }

    // ============================================================
    // 18. WORK ORDER CHECKLISTS & COMMENTS
    // ============================================================
    // Checklists for first work order
    await db.workOrderChecklist.createMany({
      data: [
        { workOrderId: workOrders[0].id, item: 'Couper alimentation compresseur', completed: true, completedById: tech1.id, completedAt: new Date('2024-01-15T08:30:00') },
        { workOrderId: workOrders[0].id, item: 'Vidanger huile', completed: true, completedById: tech1.id, completedAt: new Date('2024-01-15T09:15:00') },
        { workOrderId: workOrders[0].id, item: 'Démonter palier côté aspiration', completed: true, completedById: tech1.id, completedAt: new Date('2024-01-15T11:00:00') },
        { workOrderId: workOrders[0].id, item: 'Remplacer roulement', completed: false },
        { workOrderId: workOrders[0].id, item: 'Réassembler et tester', completed: false },
      ],
    });

    // Comments
    await db.workOrderComment.createMany({
      data: [
        { workOrderId: workOrders[0].id, userId: tech1.id, content: 'Diagnostic confirmé: roulement HS côté aspiration. Remplacement en cours.', createdAt: new Date('2024-01-15T10:30:00') },
        { workOrderId: workOrders[0].id, userId: respMaint.id, content: 'OK, assurez-vous de vérifier aussi le côté refoulement pendant que le compresseur est à l\'arrêt.', createdAt: new Date('2024-01-15T11:00:00') },
        { workOrderId: workOrders[6].id, userId: tech2.id, content: 'Arrêt d\'urgence confirmé. Température paliers à 125°C, bien au-dessus du seuil. Investigation en cours.', createdAt: new Date('2024-01-08T14:00:00') },
        { workOrderId: workOrders[6].id, userId: respMaint.id, content: 'Contact Siemens pour diagnostic. Équipe de soutien en route depuis Conakry.', createdAt: new Date('2024-01-08T15:30:00') },
      ],
    });

    // Update user last logins
    await db.user.updateMany({ data: { lastLogin: new Date() } });

    console.log('✅ SIGG GMAO database seeded successfully!');

    return Response.json({
      message: 'Database seeded successfully!',
      stats: {
        sites: sites.length,
        users: users.length,
        equipmentCategories: categories.length,
        equipment: equipment.length,
        workOrders: workOrders.length,
        incidents: incidents.length,
        maintenancePlans: maintenancePlans.length,
        parts: parts.length,
        warehouses: warehouses.length,
        suppliers: suppliers.length,
        costCenters: costCenters.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
