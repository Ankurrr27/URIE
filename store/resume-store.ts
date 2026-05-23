"use client";

import { create } from "zustand";
import type { Resume, ResumeSection } from "@/types/resume";

type ResumeState = {
  activeResume: Resume | null;
  setActiveResume: (resume: Resume) => void;
  updateSettings: (settings: Record<string, unknown>) => void;
  updateContact: (contact: Record<string, unknown>) => void;
  updateSection: (sectionId: string, patch: Partial<ResumeSection>) => void;
  reorderSections: (sectionIds: string[]) => void;
};

export const useResumeStore = create<ResumeState>((set) => ({
  activeResume: null,
  setActiveResume: (resume) => set({ activeResume: resume }),
  updateSettings: (settings) =>
    set((state) => ({
      activeResume: state.activeResume
        ? { ...state.activeResume, settings: { ...state.activeResume.settings, ...settings } }
        : null
    })),
  updateContact: (contact) =>
    set((state) => ({
      activeResume: state.activeResume
        ? { ...state.activeResume, contact: { ...state.activeResume.contact, ...contact } }
        : null
    })),
  updateSection: (sectionId, patch) =>
    set((state) => ({
      activeResume: state.activeResume
        ? {
            ...state.activeResume,
            sections: state.activeResume.sections.map((section) =>
              section.id === sectionId ? { ...section, ...patch } : section
            )
          }
        : null
    })),
  reorderSections: (sectionIds) =>
    set((state) => ({
      activeResume: state.activeResume
        ? {
            ...state.activeResume,
            sections: sectionIds
              .map((id, position) => {
                const section = state.activeResume!.sections.find((item) => item.id === id);
                return section ? { ...section, position } : null;
              })
              .filter(Boolean) as ResumeSection[]
          }
        : null
    }))
}));
