'use client';

import { useTheme } from 'next-themes';
import { Bell, Search, Sun, Moon, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore, type ModuleKey } from '@/store/app-store';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

const moduleTitles: Record<ModuleKey, string> = {
  dashboard: 'Tableau de bord',
  equipment: 'Gestion des Équipements',
  'work-orders': 'Ordres de Travail',
  incidents: 'Gestion des Incidents',
  maintenance: 'Plans de Maintenance',
  stock: 'Gestion du Stock',
  financial: 'Suivi Financier',
  'ai-assistant': 'Assistant IA',
  settings: 'Paramètres',
};

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { activeModule, sidebarOpen, setSidebarOpen } = useAppStore();
  const [notifCount, setNotifCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    // Use microtask to avoid synchronous setState in effect
    Promise.resolve().then(() => {
      setMounted(true);
    });
    api.getNotifications().then((data) => {
      const items = Array.isArray(data) ? data : data?.data || [];
      setNotifCount(items.filter((n: any) => !n.isRead).length);
    }).catch(() => {});
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {moduleTitles[activeModule]}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            SIGG — Société Interprofessionnelle du Gaz de Guinée
          </p>
        </div>
      </div>

      {/* Center search - hidden on mobile */}
      <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher équipements, OT, incidents..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="w-4 h-4" />
          {notifCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-sigg-red text-white border-0">
              {notifCount}
            </Badge>
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium">Amadou Diallo</span>
                <span className="text-[10px] text-muted-foreground">Super Admin</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
