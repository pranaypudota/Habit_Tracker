import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../lib/api';
import type { Habit, HabitCreate, HabitEntry, TargetProgress, HabitInsight, Expense, Subscription } from '../types';

interface HabitState {
    habits: Habit[];
    entries: Record<string, HabitEntry[]>; // habit_id → entries
    heatmaps: Record<string, Record<string, number>>; // habit_id → { date: level }
    streaks: Record<string, number>;
    strengths: Record<string, { monthly: number, rolling: number }>;
    targetProgress: Record<string, TargetProgress>;
    insights: HabitInsight[];
    completedToday: string[];
    recentExpenses: Expense[];
    monthlyExpenseTotal: number;
    monthlyBurn: number;
    activeSubscriptions: Subscription[];
    isLoading: boolean;
    error: string | null;
}

interface HabitActions {
    fetchAll: () => Promise<void>;
    fetchHabits: () => Promise<void>;
    fetchInsights: () => Promise<void>;
    createHabit: (data: HabitCreate) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    completeHabit: (id: string, date: string) => Promise<{ is_over_achievement?: boolean; warning?: string } | undefined>;
    fetchEntries: (id: string) => Promise<void>;
    fetchHeatmap: (id: string) => Promise<void>;
    acceptSuggestion: (id: string, type: string, newTarget: number) => Promise<void>;
    dismissSuggestion: (id: string, type: string) => Promise<void>;
}

export type HabitStore = HabitState & HabitActions;

export const useHabitStore = create<HabitStore>()(
    subscribeWithSelector((set, get) => ({
        habits: [],
        entries: {},
        heatmaps: {},
        streaks: {},
        strengths: {},
        targetProgress: {},
        insights: [],
        completedToday: [],
        recentExpenses: [],
        monthlyExpenseTotal: 0,
        monthlyBurn: 0,
        activeSubscriptions: [],
        isLoading: false,
        error: null,

        fetchAll: async () => {
            set({ isLoading: true, error: null });
            try {
                const data = await api.dashboard.today();
                set({
                    habits: data.habits,
                    streaks: data.streaks,
                    strengths: data.habit_strengths,
                    targetProgress: data.target_progress || {},
                    completedToday: data.completed_today,
                    entries: data.entries_today,
                    heatmaps: data.heatmaps,
                    recentExpenses: data.recent_expenses,
                    monthlyExpenseTotal: data.monthly_expense_total,
                    monthlyBurn: data.monthly_committed_burn,
                    activeSubscriptions: data.active_subscriptions || [],
                });
            } catch (e: unknown) {
                set({ error: e instanceof Error ? e.message : String(e) });
            } finally {
                set({ isLoading: false });
            }
        },

        fetchInsights: async () => {
            try {
                const insights = await api.analytics.insights();
                set({ insights });
            } catch {
                set({ insights: [] });
            }
        },

        acceptSuggestion: async (id, type, newTarget) => {
            await api.habits.acceptSuggestion(id, type, newTarget);
            set((s) => ({ insights: s.insights.filter(i => i.habit_id !== id) }));
            await get().fetchAll();
        },

        dismissSuggestion: async (id, type) => {
            await api.habits.dismissSuggestion(id, type);
            set((s) => ({ insights: s.insights.filter(i => i.habit_id !== id) }));
        },

        fetchHabits: async () => {
            set({ isLoading: true, error: null });
            try {
                // To keep it simple, fetchAll handles everything now
                await get().fetchAll();
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

        /** Mark a habit as completed on a given date (idempotent).
         * Returns over-achievement info if goal is exceeded. */
        completeHabit: async (id, date) => {
            const result = await api.habits.complete(id, date);
            const entry = result.entry || result;
            set((s) => {
                const existing = s.entries[id] ?? [];
                return {
                    entries: {
                        ...s.entries,
                        [id]: [...existing, entry],
                    },
                };
            });
            await get().fetchHeatmap(id);
            await get().fetchAll();
            return { is_over_achievement: result.is_over_achievement, warning: result.over_achievement_warning };
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
