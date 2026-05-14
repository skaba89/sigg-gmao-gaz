'use client';

import { useTheme } from 'next-themes';
import { Bell, Search, Sun, Moon, Menu, X, User, Settings, LogOut, Check } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore, type ModuleKey } from '@/store/app-store';
import { useToast } from '@/hooks/use-toast';
import { api, formatDateTime } from '@/lib/api';
import { useEffect, useRef, useState, useCallback } from 'react';

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

// Search term mappings
const equipmentTerms = ['équipement', 'equipement', 'compresseur', 'pompe', 'moteur', 'gaz', 'vanne', 'turbine', 'générateur', 'generateur', 'transformateur', 'chaudière', 'chaudiere', 'machine'];
const workOrderTerms = ['ot', 'ordre', 'travail', 'intervention', 'curatif', 'préventif', 'preventif', 'correctif', 'planifié', 'planifie', 'réparation', 'reparation'];
const incidentTerms = ['incident', 'panne', 'urgence', 'critique', 'fuite', 'explosion', 'alarme', 'défaut', 'defaut', 'anomalie', 'danger'];

function getSearchModule(query: string): ModuleKey {
  const q = query.toLowerCase().trim();
  if (workOrderTerms.some(t => q.includes(t))) return 'work-orders';
  if (incidentTerms.some(t => q.includes(t))) return 'incidents';
  if (equipmentTerms.some(t => q.includes(t))) return 'equipment';
  return 'equipment';
}

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { activeModule, sidebarOpen, setSidebarOpen, setActiveModule, setSearchQuery, user, logout } = useAppStore();
  const { toast } = useToast();

  // Search state
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const hasFetchedRef = useRef(false);

  // Profile dialog state
  const [profileOpen, setProfileOpen] = useState(false);

  // Logout dialog state
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Theme mounted
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    Promise.resolve().then(() => {
      setMounted(true);
    });
    api.getNotifications().then((data) => {
      const items = Array.isArray(data) ? data : data?.data || [];
      setNotifications(items);
      setNotifCount(items.filter((n: any) => !n.isRead).length);
    }).catch(() => {});
  }, []);

  // Load fresh notifications when popover opens
  const handleNotifOpenChange = useCallback((open: boolean) => {
    setNotifOpen(open);
    if (open) {
      setNotifLoading(true);
      api.getNotifications().then((data) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        setNotifications(items);
        setNotifCount(items.filter((n: any) => !n.isRead).length);
      }).catch(() => {}).finally(() => setNotifLoading(false));
    }
  }, []);

  // Search handler
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    const targetModule = getSearchModule(searchValue);
    setSearchQuery(searchValue.trim());
    setActiveModule(targetModule);
    toast({
      title: 'Recherche',
      description: `Recherche de "${searchValue.trim()}" dans ${moduleTitles[targetModule]}`,
    });
  }, [searchValue, setSearchQuery, setActiveModule, toast]);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, [setSearchQuery]);

  // Mark all as read
  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setNotifCount(0);
    toast({
      title: 'Notifications',
      description: 'Toutes les notifications marquées comme lues',
    });
  }, [toast]);

  // Logout handler
  const handleLogout = useCallback(() => {
    setLogoutOpen(false);
    logout();
    toast({
      title: 'Déconnexion',
      description: 'Déconnexion réussie. À bientôt !',
    });
  }, [toast, logout]);

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
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Rechercher équipements, OT, incidents..."
            className="pl-9 pr-8 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
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

        {/* Notifications Popover */}
        <Popover open={notifOpen} onOpenChange={handleNotifOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-sigg-red text-white border-0">
                  {notifCount > 9 ? '9+' : notifCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {notifCount > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {notifCount} non lue{notifCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <Separator />
            <ScrollArea className="max-h-72">
              {notifLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        )}
                        <div className={`flex-1 min-w-0 ${notif.isRead ? 'ml-4' : ''}`}>
                          <p className={`text-sm ${!notif.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {notif.createdAt ? formatDateTime(notif.createdAt) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Separator />
            <div className="p-2 flex flex-col gap-1">
              {notifCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs h-8"
                  onClick={handleMarkAllRead}
                >
                  <Check className="w-3 h-3 mr-1.5" />
                  Marquer tout comme lu
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-8 text-primary"
                onClick={() => {
                  setNotifOpen(false);
                  setActiveModule('settings');
                }}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SI'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium">{user?.name || 'Utilisateur'}</span>
                <span className="text-[10px] text-muted-foreground">{user?.role || 'Connecté'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveModule('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setLogoutOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil utilisateur</DialogTitle>
            <DialogDescription>Informations de votre compte</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SI'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{user?.name || 'Utilisateur'}</h3>
                <p className="text-sm text-muted-foreground">{user?.role || 'Connecté'}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nom complet</span>
                <span className="text-sm font-medium">{user?.name || 'Utilisateur'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user?.email || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rôle</span>
                <Badge variant="secondary">{user?.role || '-'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Téléphone</span>
                <span className="text-sm font-medium">+224 622 00 00 00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Département</span>
                <span className="text-sm font-medium">Maintenance</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à l&apos;application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Déconnexion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
