import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModuleKey = 'dashboard' | 'equipment' | 'work-orders' | 'incidents' | 'maintenance' | 'stock' | 'financial' | 'iot' | 'ai-assistant' | 'settings';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  siteId?: string;
  site?: any;
  isActive: boolean;
  lastLogin?: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // Navigation
  activeModule: ModuleKey;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  searchQuery: string;

  // Auth actions
  login: (user: User, token: string) => void;
  logout: () => void;

  // Navigation actions
  setActiveModule: (module: ModuleKey) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth state
      isAuthenticated: false,
      user: null,
      token: null,

      // Navigation state
      activeModule: 'dashboard',
      sidebarOpen: false,
      sidebarCollapsed: false,
      searchQuery: '',

      // Auth actions
      login: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          token,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          activeModule: 'dashboard',
          sidebarOpen: false,
        }),

      // Navigation actions
      setActiveModule: (module) => set({ activeModule: module, sidebarOpen: false }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'sigg-gmao-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
