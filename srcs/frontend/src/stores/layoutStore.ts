import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarExpanded: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      isMobileNavOpen: false,
      toggleMobileNav: () =>
        set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
    }),
    {
      name: 'layout-storage', // Persist sidebar state in localStorage
      partialize: (state) => ({ isSidebarExpanded: state.isSidebarExpanded }), // Only persist sidebar state
    }
  )
);
