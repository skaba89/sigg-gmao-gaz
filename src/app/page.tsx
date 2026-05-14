'use client';

import { ThemeProvider } from 'next-themes';
import { useAppStore, type ModuleKey } from '@/store/app-store';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { DashboardView } from '@/components/dashboard-view';
import { EquipmentView } from '@/components/equipment-view';
import { WorkOrdersView } from '@/components/work-orders-view';
import { IncidentsView } from '@/components/incidents-view';
import { MaintenanceView } from '@/components/maintenance-view';
import { StockView } from '@/components/stock-view';
import { FinancialView } from '@/components/financial-view';
import { AIAssistantView } from '@/components/ai-assistant-view';
import { FloatingChatBot } from '@/components/floating-chatbot';
import { SettingsView } from '@/components/settings-view';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

const moduleComponents: Record<ModuleKey, React.ComponentType> = {
  dashboard: DashboardView,
  equipment: EquipmentView,
  'work-orders': WorkOrdersView,
  incidents: IncidentsView,
  maintenance: MaintenanceView,
  stock: StockView,
  financial: FinancialView,
  'ai-assistant': AIAssistantView,
  settings: SettingsView,
};

function SIGGApp() {
  const { activeModule } = useAppStore();
  const ActiveComponent = moduleComponents[activeModule] || DashboardView;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - desktop */}
      <div className="hidden lg:flex">
        <AppSidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Floating AI Chatbot - visible on all pages */}
      <FloatingChatBot />
    </div>
  );
}

function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (!sidebarOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />
      <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
        <AppSidebar />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SIGGApp />
    </ThemeProvider>
  );
}
