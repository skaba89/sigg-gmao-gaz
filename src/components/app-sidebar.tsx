'use client';

import { useAppStore, type ModuleKey } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Server,
  ClipboardList,
  AlertTriangle,
  CalendarClock,
  Package,
  DollarSign,
  Bot,
  Settings,
  ChevronLeft,
  Flame,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems: { key: ModuleKey; label: string; icon: React.ElementType; section?: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, section: 'PRINCIPAL' },
  { key: 'equipment', label: 'Équipements', icon: Server },
  { key: 'work-orders', label: 'Ordres de travail', icon: ClipboardList },
  { key: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { key: 'maintenance', label: 'Plans maintenance', icon: CalendarClock, section: 'GESTION' },
  { key: 'stock', label: 'Stock', icon: Package },
  { key: 'financial', label: 'Financier', icon: DollarSign },
  { key: 'ai-assistant', label: 'Assistant IA', icon: Bot, section: 'OUTILS' },
  { key: 'settings', label: 'Paramètres', icon: Settings },
];

export function AppSidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar z-30',
          'dark:bg-[oklch(0.12_0.02_250)]'
        )}
      >
        {/* Logo area */}
        <div className={cn(
          'flex items-center h-16 px-3 border-b border-border',
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="w-9 h-9 rounded-lg teal-gradient flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="font-bold text-sm tracking-wider text-foreground">SIGG GMAO</div>
              <div className="text-[10px] text-muted-foreground tracking-wide">Smart Maintenance</div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <div key={item.key}>
              {item.section && !sidebarCollapsed && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/70 uppercase">
                  {item.section}
                </div>
              )}
              {item.section && sidebarCollapsed && (
                <div className="my-2 mx-2 h-px bg-border" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveModule(item.key)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                      sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                      activeModule === item.key
                        ? 'bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className={cn(
                      'w-[18px] h-[18px] flex-shrink-0',
                      activeModule === item.key && 'text-primary'
                    )} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && activeModule === item.key && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </button>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <ChevronLeft className={cn(
              'w-4 h-4 transition-transform duration-200',
              sidebarCollapsed && 'rotate-180'
            )} />
            {!sidebarCollapsed && <span>Réduire</span>}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
