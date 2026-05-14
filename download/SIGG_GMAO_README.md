<p align="center">
  <img src="https://img.shields.io/badge/SIGG-GMAO%20Enterprise%20Suite-0f172a?style=for-the-badge&labelColor=059669&color=0f172a" alt="SIGG GMAO Enterprise Suite" />
</p>

<h1 align="center">SIGG GMAO Enterprise Suite</h1>
<h3 align="center">Plateforme Intelligente de Gestion de Maintenance Assistée par Ordinateur</h3>
<h4 align="center">Société Interprofessionnelle du Gaz de Guinée</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-059669?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/Licence-Propriétaire-0f172a?style=flat-square" alt="Licence" />
  <img src="https://img.shields.io/badge/Status-Production-ready-22c55e?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square" alt="Tailwind CSS" />
</p>

---

## Apercu du Projet

**SIGG GMAO Enterprise Suite** est une plateforme de gestion de maintenance assistee par ordinateur (GMAO) de nouvelle generation, concue pour la **Societe Interprofessionnelle du Gaz de Guinee**. Elle integre l'intelligence artificielle, l'IoT et des tableaux de bord en temps reel pour optimiser la maintenance preventive et corrective des infrastructures gazeres.

### Fonctionnalites Cles

- **Tableau de bord interactif** — KPIs en temps reel (MTTR, MTBF, Disponibilite, Taux de panne)
- **Gestion des equipements** — Cycle de vie complet avec scoring de sante et criticite
- **Bons de travail** — Workflow complet (creation → planification → execution → validation)
- **Gestion des incidents** — Signalement, suivi, analyse des causes racines
- **Maintenance preventive** — Plans periodiques, conditionnels et predictifs
- **Gestion des stocks** — Magasins, mouvements, commandes d'achat, alertes seuil
- **Suivi financier** — Centres de couts, budgets, analyse des depenses de maintenance
- **Assistant IA** — Chatbot intelligent pour le diagnostic et les recommandations
- **Notifications** — Alertes en temps reel (in-app, email, SMS, push)
- **Multisite** — Gestion centralisee de plusieurs sites de production et distribution
- **Mode sombre/clair** — Interface adaptive avec thematique dynamique
- **Responsive** — Optimise pour desktop, tablette et mobile
- **Audit & Tracabilite** — Journal complet de toutes les actions utilisateurs

---

## Architecture Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | Next.js (App Router) | 16.x |
| **Langage** | TypeScript | 5.x |
| **UI Components** | shadcn/ui (New York) | Derniere |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | 12.x |
| **Graphiques** | Recharts | 2.x |
| **State Client** | Zustand | 5.x |
| **State Serveur** | TanStack Query | 5.x |
| **ORM** | Prisma | 6.x |
| **Base de donnees** | SQLite (dev) / PostgreSQL (prod) | — |
| **Authentification** | NextAuth.js / JWT custom | 4.x |
| **Hashing** | PBKDF2 (SHA-512, 10000 iterations) | — |
| **Icons** | Lucide React | 0.525+ |
| **Formulaires** | React Hook Form + Zod | 7.x / 4.x |
| **Dates** | date-fns | 4.x |
| **Tableaux** | TanStack Table | 8.x |
| **Drag & Drop** | dnd-kit | 6.x |
| **Theme** | next-themes | 0.4.x |
| **Toast** | Sonner | 2.x |

---

## Modules Fonctionnels

### 1. Tableau de Bord (Dashboard)
Le centre de commande de la plateforme. Affiche les KPIs critiques, graphiques de tendances, alertes et indicateurs de performance en temps reel.
- KPIs : MTTR, MTBF, Disponibilite, Taux de panne, Taux de conformite
- Graphiques : Repartition par criticite, tendances mensuelles, statuts des interventions
- Alertes : Equipements en panne, stocks bas, echeances de maintenance

### 2. Gestion des Equipements
Gestion complete du cycle de vie des equipements gaziers, depuis l'installation jusqu'a la mise au rebut.
- Fiches equipements detaillees (fabricant, modele, numero de serie, garantie)
- Classification par criticite (CRITIQUE, IMPORTANTE, MOYENNE, FAIBLE)
- Scoring de sante automatique (0-100)
- Documents techniques rattaches (manuels, schemas, certificats)
- Parametres de suivi avec seuils min/max
- Geolocalisation des equipements

### 3. Bons de Travail (Work Orders)
Workflow complet de gestion des interventions de maintenance.
- Types : Preventive, Corrective, Ameliorative, Urgente
- Statuts : En attente → Planifiee → En cours → Suspendue → Terminee → Validee
- Priorites : P1 Critique, P2 Haute, P3 Moyenne, P4 Basse
- Checklists d'intervention avec validation
- Suivi des heures estimees vs reelles
- Pieces consommees liees au stock
- Commentaires et signatures numeriques

### 4. Gestion des Incidents
Signalement et suivi des incidents avec analyse des causes racines.
- Severites : Mineure, Majeure, Critique
- Workflow : Ouvert → En cours → Resolu → Cloture
- Analyse des causes racines (Root Cause Analysis)
- Actions correctives documentees
- Liaison automatique avec les bons de travail

### 5. Maintenance Preventive
Planification et suivi des maintenances preventives automatisees.
- Types de plans : Periodique, Conditionnel, Predictif
- Frequences : Journaliere, Hebdomadaire, Mensuelle, Trimestrielle, Semestrielle, Annuelle
- Taches detaillees par plan avec estimation de duree
- Generation automatique de bons de travail
- Calcul automatique des prochaines echeances

### 6. Gestion des Stocks
Gestion complete des pieces de rechange et fournitures.
- Magasins multi-sites (Central, Secondaire, Mobile)
- Mouvements : Entree, Sortie, Transfert, Ajustement, Retour
- Alertes de seuil minimum automatiques
- Commandes d'achat avec workflow d'approbation
- Gestion des fournisseurs avec notation
- Suivi des prix et delais de livraison

### 7. Suivi Financier
Pilotage budgetaire et analyse des couts de maintenance.
- Centres de couts par site avec budgets
- Types de depenses : Main d'oeuvre, Pieces, Outillage, Sous-traitance, Autre
- Tableau de bord financier avec comparatif budget/depenses
- Devise GNF (Franc Guineen)
- Export et rapports financiers

### 8. Assistant IA
Chatbot intelligent integre pour le diagnostic et les recommandations de maintenance.
- Diagnostic predictif des equipements
- Recommandations de maintenance
- Reponses aux questions techniques
- Analyse des tendances et patterns
- Suggestions d'optimisation des couts

### 9. Parametres & Administration
Configuration systeme et gestion des utilisateurs.
- Gestion des utilisateurs et roles
- 8 roles : Super Admin, Direction Generale, Resp. Maintenance, Resp. Stock, Technicien, Auditeur, Finance, Prestataire
- Gestion des sites et localisations
- Journaux d'audit
- Configuration des notifications

---

## Schema de Base de Donnees

La plateforme repose sur **25 modeles** de donnees organises en 10 domaines fonctionnels :

| # | Domaine | Modeles |
|---|---------|---------|
| 1 | Authentification | `User`, `AuditLog` |
| 2 | Localisation | `Site`, `Building`, `Zone` |
| 3 | Equipements | `EquipmentCategory`, `Equipment`, `EquipmentDocument`, `EquipmentParameter` |
| 4 | Bons de Travail | `WorkOrder`, `WorkOrderPart`, `WorkOrderChecklist`, `WorkOrderComment` |
| 5 | Maintenance Preventive | `MaintenancePlan`, `MaintenancePlanTask` |
| 6 | Incidents | `Incident` |
| 7 | Stock | `Warehouse`, `PartCategory`, `Part`, `WarehouseStock`, `StockMovement`, `Supplier`, `PurchaseOrder`, `PurchaseOrderItem` |
| 8 | Finance | `CostCenter`, `MaintenanceCost` |
| 9 | Notifications | `Notification` |
| 10 | KPIs | `KPIRecord` |

### Relations Cles
- `User` → 12 relations (technicien, demandeur, superviseur, auditeur...)
- `Equipment` → 7 relations (bons de travail, incidents, plans, documents, parametres, couts)
- `WorkOrder` → 8 relations (equipement, technicien, pieces, checklists, commentaires, mouvements stock, couts, incidents)
- `Site` → 9 relations (utilisateurs, equipements, batiments, ordres, incidents, magasins, centres de couts, couts, KPIs)

---

## Reference API

La plateforme expose **48+ endpoints REST** organises par domaine fonctionnel :

### Authentification
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/login` | Connexion utilisateur |
| `POST` | `/api/auth/logout` | Deconnexion |
| `POST` | `/api/auth/register` | Inscription |
| `GET` | `/api/auth/me` | Profil utilisateur courant |

### Tableau de Bord
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Statistiques generales |
| `GET` | `/api/dashboard/kpi` | Indicateurs KPIs |
| `GET` | `/api/dashboard/charts` | Donnees graphiques |

### Equipements
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/equipment` | Liste des equipements |
| `POST` | `/api/equipment` | Creation d'equipement |
| `GET` | `/api/equipment/[id]` | Detail d'equipement |
| `PUT` | `/api/equipment/[id]` | Mise a jour d'equipement |

### Bons de Travail
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/work-orders` | Liste des bons de travail |
| `POST` | `/api/work-orders` | Creation de bon de travail |
| `GET` | `/api/work-orders/[id]` | Detail de bon de travail |
| `PUT` | `/api/work-orders/[id]` | Mise a jour de bon de travail |

### Incidents
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/incidents` | Liste des incidents |
| `POST` | `/api/incidents` | Declaration d'incident |
| `GET` | `/api/incidents/[id]` | Detail d'incident |
| `PUT` | `/api/incidents/[id]` | Mise a jour d'incident |

### Maintenance Preventive
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/maintenance-plans` | Liste des plans |
| `POST` | `/api/maintenance-plans` | Creation de plan |
| `GET` | `/api/maintenance-plans/[id]` | Detail de plan |
| `PUT` | `/api/maintenance-plans/[id]` | Mise a jour de plan |

### Stock
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/stock/parts` | Liste des pieces |
| `POST` | `/api/stock/parts` | Ajout de piece |
| `GET` | `/api/stock/parts/[id]` | Detail de piece |
| `GET` | `/api/stock/warehouses` | Liste des magasins |
| `GET` | `/api/stock/movements` | Mouvements de stock |
| `POST` | `/api/stock/movements` | Nouveau mouvement |
| `GET` | `/api/stock/suppliers` | Liste des fournisseurs |
| `GET` | `/api/stock/purchase-orders` | Commandes d'achat |

### Finance
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/financial/costs` | Liste des couts |
| `GET` | `/api/financial/cost-centers` | Centres de couts |
| `GET` | `/api/financial/summary` | Resume financier |

### Utilisateurs & Sites
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/users` | Liste des utilisateurs |
| `GET` | `/api/users/[id]` | Detail utilisateur |
| `PUT` | `/api/users/[id]` | Mise a jour utilisateur |
| `GET` | `/api/sites` | Liste des sites |

### Notifications
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/notifications` | Liste des notifications |
| `PUT` | `/api/notifications/[id]` | Marquer comme lue |

### Intelligence Artificielle
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/ai/chat` | Conversation avec l'assistant IA |

### Systeme
| Methode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/seed` | Initialisation des donnees de demonstration |
| `GET` | `/api` | Verification de l'etat de l'API |

---

## Installation & Deploiement

### Prerequis

- **Node.js** >= 18.x ou **Bun** >= 1.x
- **npm**, **yarn** ou **bun** (gestionnaire de paquets)
- **Git**

### Installation en Developpement

```bash
# 1. Cloner le depot
git clone https://github.com/sigg-gn/gmao-platform.git
cd gmao-platform

# 2. Installer les dependances
bun install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Editer le fichier .env avec vos parametres

# 4. Initialiser la base de donnees
bun run db:push
bun run db:generate

# 5. Lancer le serveur de developpement
bun run dev

# 6. (Optionnel) Seeder la base de donnees
# Acceder a http://localhost:3000/api/seed
```

### Variables d'Environnement

```env
# Base de donnees
DATABASE_URL="file:./dev.db"

# Authentification
TOKEN_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# IA (optionnel)
AI_API_KEY="your-ai-api-key"

# Stockage fichiers (optionnel)
STORAGE_ENDPOINT="http://localhost:9000"
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minioadmin"
STORAGE_BUCKET="sigg-gmao"
```

### Deploiement avec Docker

```bash
# Construction et lancement
docker-compose up -d --build

# Verification des services
docker-compose ps

# Logs
docker-compose logs -f app
```

### Deploiement avec Kubernetes

```bash
# Appliquer les manifests
kubectl apply -f kubernetes-deployment.yaml

# Verifier le deploiement
kubectl get pods -l app=sigg-gmao

# Acceder au service
kubectl port-forward svc/sigg-gmao 3000:80
```

---

## Identifiants de Demonstration

Pour tester la plateforme, utilisez les identifiants suivants :

| Role | Email | Mot de passe |
|------|-------|-------------|
| **Super Admin** | `admin@sigg-gn.com` | `admin123` |
| Resp. Maintenance | `resp.maintenance@sigg-gn.com` | `admin123` |
| Technicien | `technicien@sigg-gn.com` | `admin123` |
| Resp. Stock | `resp.stock@sigg-gn.com` | `admin123` |
| Direction Generale | `dg@sigg-gn.com` | `admin123` |
| Finance | `finance@sigg-gn.com` | `admin123` |

> **Attention** : Changez ces mots de passe en production !

---

## Structure du Projet

```
sigg-gmao/
├── prisma/
│   └── schema.prisma          # Schema de base de donnees (25 modeles)
├── db/
│   └── custom.db              # Base SQLite locale
├── public/
│   ├── logo.svg               # Logo SIGG
│   └── robots.txt             # Configuration robots
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Page principale (SPA)
│   │   ├── globals.css        # Styles globaux
│   │   └── api/               # API Routes (48+ endpoints)
│   │       ├── auth/          # Authentification
│   │       │   ├── login/     #   POST connexion
│   │       │   ├── logout/    #   POST deconnexion
│   │       │   ├── register/  #   POST inscription
│   │       │   └── me/        #   GET profil courant
│   │       ├── dashboard/     # Tableau de bord
│   │       │   ├── stats/     #   GET statistiques
│   │       │   ├── kpi/       #   GET indicateurs
│   │       │   └── charts/    #   GET donnees graphiques
│   │       ├── equipment/     # Equipements
│   │       │   ├── route.ts   #   GET liste, POST creation
│   │       │   └── [id]/      #   GET detail, PUT mise a jour
│   │       ├── work-orders/   # Bons de travail
│   │       │   ├── route.ts   #   GET liste, POST creation
│   │       │   └── [id]/      #   GET detail, PUT mise a jour
│   │       ├── incidents/     # Incidents
│   │       │   ├── route.ts   #   GET liste, POST declaration
│   │       │   └── [id]/      #   GET detail, PUT mise a jour
│   │       ├── maintenance-plans/ # Maintenance preventive
│   │       │   ├── route.ts   #   GET liste, POST creation
│   │       │   └── [id]/      #   GET detail, PUT mise a jour
│   │       ├── stock/         # Gestion des stocks
│   │       │   ├── parts/     #   Pieces detachees
│   │       │   ├── warehouses/ #  Magasins
│   │       │   ├── movements/ #   Mouvements de stock
│   │       │   ├── suppliers/ #   Fournisseurs
│   │       │   └── purchase-orders/ # Commandes d'achat
│   │       ├── financial/     # Suivi financier
│   │       │   ├── costs/     #   Couts de maintenance
│   │       │   ├── cost-centers/ # Centres de couts
│   │       │   └── summary/   #   Resume financier
│   │       ├── users/         # Gestion utilisateurs
│   │       ├── sites/         # Gestion des sites
│   │       ├── notifications/ # Notifications
│   │       ├── ai/            # Assistant IA
│   │       │   └── chat/      #   POST conversation
│   │       └── seed/          # Initialisation donnees
│   ├── components/
│   │   ├── ui/                # Composants shadcn/ui (40+)
│   │   ├── dashboard-view.tsx # Module Tableau de bord
│   │   ├── equipment-view.tsx # Module Equipements
│   │   ├── work-orders-view.tsx # Module Bons de travail
│   │   ├── incidents-view.tsx # Module Incidents
│   │   ├── maintenance-view.tsx # Module Maintenance
│   │   ├── stock-view.tsx     # Module Stocks
│   │   ├── financial-view.tsx # Module Finance
│   │   ├── ai-assistant-view.tsx # Module Assistant IA
│   │   ├── settings-view.tsx  # Module Parametres
│   │   ├── app-sidebar.tsx    # Barre laterale
│   │   └── app-header.tsx     # En-tete
│   ├── lib/
│   │   ├── api.ts             # Client API & utilitaires
│   │   ├── auth-utils.ts      # Authentification & JWT
│   │   ├── db.ts              # Client Prisma
│   │   └── utils.ts           # Utilitaires generaux
│   ├── store/
│   │   └── app-store.ts      # Etat global Zustand
│   └── hooks/
│       ├── use-toast.ts       # Hook notifications toast
│       └── use-mobile.ts      # Hook detection mobile
├── download/                  # Documentation & DevOps
│   ├── SIGG_GMAO_README.md
│   ├── SIGG_GMAO_ARCHITECTURE.md
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── kubernetes-deployment.yaml
│   ├── nginx.conf
│   └── .github-workflows-ci.yml
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── Caddyfile                  # Gateway configuration
└── eslint.config.mjs
```

---

## Roadmap & Evolutions Prevues

### v1.1 — Q2 2026
- [ ] **Application mobile native** (React Native) pour les techniciens sur le terrain
- [ ] **Integration IoT** — Capteurs en temps reel pour la maintenance predictive
- [ ] **QR Codes** — Scan des equipements pour acces rapide aux fiches
- [ ] **Mode hors-ligne** — Synchronisation des interventions sans connexion

### v1.2 — Q3 2026
- [ ] **Module GIS** — Carte interactive des equipements et infrastructures
- [ ] **Planification avancee** — Ordonnancement intelligent avec algorithmes genetiques
- [ ] **Rapports PDF** — Generation automatique de rapports d'intervention
- [ ] **Tableau de bord exec** — Vue strategique pour la direction generale

### v2.0 — Q4 2026
- [ ] **Jumeau numerique** — Modelisation 3D des installations
- [ ] **Maintenance predictive IA** — Modeles Machine Learning pour la prediction de pannes
- [ ] **Integration ERP** — Connexion avec les systemes comptables et RH
- [ ] **Marketplace** — Catalogue de pieces avec comparaison de fournisseurs
- [ ] **Multi-langues** — Support Anglais, Portugais, Arabic

### v2.5 — 2027
- [ ] **Realite augmentee** — Assistance visuelle pour les techniciens
- [ ] **Drone inspection** — Integration d'images drone pour l'inspection
- [ ] **Blockchain** — Tracabilite immutable des interventions critiques
- [ ] **Chatbot vocal** — Interface vocale pour les interventions sur le terrain

---

## Contribution

### Regles de Contribution

1. **Fork** le depot principal
2. Creer une **branche feature** (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** les changements (`git commit -m 'Ajout nouvelle fonctionnalite'`)
4. **Push** sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Creer une **Pull Request**

### Normes de Code

- TypeScript strict (pas de `any` sauf necessite absolue)
- Composants fonctionnels avec hooks
- Conventions de nommage : camelCase (variables), PascalCase (composants)
- Tests unitaires pour les fonctions critiques
- Documentation des fonctions publiques

---

## Licence & Copyright

```
Copyright (c) 2024-2026 Societe Interprofessionnelle du Gaz de Guinee (SIGG)
Tous droits reserves.

Ce logiciel et sa documentation sont la propriete exclusive de la SIGG.
Toute reproduction, distribution ou modification sans autorisation ecrite
prealable est strictement interdite.

Pour toute demande de licence, contacter :
Direction des Systemes d'Information
Societe Interprofessionnelle du Gaz de Guinee
Conakry, Republique de Guinee
Email: dsi@sigg-gn.com
```

---

<p align="center">
  <strong>SIGG GMAO Enterprise Suite</strong><br/>
  <em>Pour une maintenance intelligente et preventive des infrastructures gazeres de Guinee</em><br/><br/>
  Concu avec soin par la Direction des Systemes d'Information — SIGG
</p>
