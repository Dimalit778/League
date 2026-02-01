import { useSidebarStore } from '../SidebarStore';

describe('SidebarStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useSidebarStore.setState({ isOpen: false });
  });

  it('starts with sidebar closed', () => {
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('opens the sidebar', () => {
    useSidebarStore.getState().openSidebar();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('closes the sidebar', () => {
    useSidebarStore.setState({ isOpen: true });
    useSidebarStore.getState().closeSidebar();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('toggles the sidebar from closed to open', () => {
    useSidebarStore.getState().toggleSidebar();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('toggles the sidebar from open to closed', () => {
    useSidebarStore.setState({ isOpen: true });
    useSidebarStore.getState().toggleSidebar();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('toggles twice returns to original state', () => {
    useSidebarStore.getState().toggleSidebar();
    useSidebarStore.getState().toggleSidebar();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });
});
