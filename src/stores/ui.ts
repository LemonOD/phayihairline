import { create } from "zustand"

/** Transient UI state shared between the header and the lazily loaded drawers. Not persisted. */
type UIState = { menuOpen: boolean; setMenuOpen: (open: boolean) => void }

export const useUI = create<UIState>()((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))
