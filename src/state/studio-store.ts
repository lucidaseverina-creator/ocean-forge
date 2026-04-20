import { create } from "zustand";

export type LeftDrawer = "chat" | "account" | "profiles" | "encyclopedia" | null;

interface StudioState {
  // Right inspector — currently active settings section (single section at a time)
  activeSection: string;
  setActiveSection: (id: string) => void;

  // Left drawer system
  leftDrawer: LeftDrawer;
  encyclopediaTarget: string | null;
  openLeftDrawer: (d: LeftDrawer) => void;
  closeLeftDrawer: () => void;
  openEncyclopedia: (target?: string) => void;

  // Capture-canvas hook (set by OceanScene, called by AI chat to grab a screenshot)
  captureCanvas: (() => string | null) | null;
  setCaptureCanvas: (fn: (() => string | null) | null) => void;
}

export const useStudio = create<StudioState>((set) => ({
  activeSection: "longSwell",
  setActiveSection: (id) => set({ activeSection: id }),

  leftDrawer: null,
  encyclopediaTarget: null,
  openLeftDrawer: (d) => set({ leftDrawer: d, encyclopediaTarget: d === "encyclopedia" ? null : null }),
  closeLeftDrawer: () => set({ leftDrawer: null }),
  openEncyclopedia: (target) => set({ leftDrawer: "encyclopedia", encyclopediaTarget: target ?? null }),

  captureCanvas: null,
  setCaptureCanvas: (fn) => set({ captureCanvas: fn }),
}));