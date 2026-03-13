import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../lib/api';
import type { Habit, HabitCreate, HabitEntry } from '../types';

interface HabitState {
    habits: Habit[];
    entries: Record<string, HabitEntry[]>; // habit_id → entries
    heatmaps: Record<string, Record<string, number>>; // habit_id → { date: level }
    isLoading: boolean;
    error: string | null;
}

interface HabitActions {
    fetchHabits: () => Promise<void>;
    createHabit: (data: HabitCreate) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    completeHabit: (id: string, date: string) => Promise<void>;
    fetchEntries: (id: string) => Promise<void>;
    fetchHeatmap: (id: string) => Promise<void>;
}

export type HabitStore = HabitState & HabitActions;

export const useHabitStore = create<HabitStore>()(
    subscribeWithSelector((set, get) => ({
        habits: [],
        entries: {},
        heatmaps: {},
        isLoading: false,
        error: null,

        fetchHabits: async () => {
            set({ isLoading: true, error: null });
            try {
                const habits = await api.habits.list();
                set({ habits });
            } catch (e: unknown) {
                set({ error: e instanceof Error ? e.message : String(e) });
            } finally {
                set({ isLoading: false });
            }
        },

        createHabit: async (data) => {
            const habit = await api.habits.create(data);
            set((s) => ({ habits: [habit, ...s.habits] }));
        },

        deleteHabit: async (id) => {
            await api.habits.delete(id);
            set((s) => ({
                habits: s.habits.filter((h) => h.id !== id),
                entries: Object.fromEntries(
                    Object.entries(s.entries).filter(([k]) => k !== id)
                ),
            }));
        },

        /** Mark a habit as completed on a given date (idempotent). */
        completeHabit: async (id, date) => {
            const entry = await api.habits.complete(id, date);
            set((s) => {
                const existing = s.entries[id] ?? [];
                // Allow multiple entries for the same date (multi-completion)
                return {
                    entries: {
                        ...s.entries,
                        [id]: [...existing, entry],
                    },
                };
            });
            // Re-fetch the heatmap and habits summary so labels update
            await get().fetchHeatmap(id);
            await get().fetchHabits();
        },

        fetchEntries: async (id) => {
            const entries = await api.habits.entries(id);
            set((s) => ({ entries: { ...s.entries, [id]: entries } }));
        },

        fetchHeatmap: async (id) => {
            const res = await api.analytics.streakHeatmap(id);
            // Convert array of {date, level} into a dictionary for O(1) rendering
            const levelMap: Record<string, number> = {};
            res.heatmap.forEach(h => {
                levelMap[h.date] = h.level;
            });
            set((s) => ({ heatmaps: { ...s.heatmaps, [id]: levelMap } }));
        },
    }))
);
