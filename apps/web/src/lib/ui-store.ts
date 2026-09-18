import { create } from 'zustand';
interface Preferences { collapsedSections: Set<string>; toggleSection: (title: string) => void }
export const useUiStore = create<Preferences>((set) => ({
  collapsedSections: new Set(),
  toggleSection: (title) => set((state) => {
    const collapsedSections = new Set(state.collapsedSections);
    if (collapsedSections.has(title)) collapsedSections.delete(title);
    else collapsedSections.add(title);
    return { collapsedSections };
  }),
}));

