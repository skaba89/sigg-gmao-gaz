import { create } from 'zustand';

export type ModuleKey = 'dashboard' | 'equipment' | 'work-orders' | 'incidents' | 'maintenance' | 'stock' | 'financial' | 'ai-assistant' | 'settings';

interface AppState {
  activeModule: ModuleKey;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  searchQuery: string;
  setActiveModule: (module: ModuleKey) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: false,
  sidebarCollapsed: false,
  searchQuery: '',
  setActiveModule: (module) => set({ activeModule: module, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
