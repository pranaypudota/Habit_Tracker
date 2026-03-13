import type {
    Habit, HabitCreate, HabitEntry,
    Expense, ExpenseCreate,
    HabitStreak, MonthlyTotal,
    DashboardToday,
} from '../types';

const BASE = 'http://localhost:8000/api/v1';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${msg}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

export const api = {
    habits: {
        list: (includeArchived = false) =>
            req<Habit[]>(`/habits/?include_archived=${includeArchived}`),
        create: (data: HabitCreate) =>
            req<Habit>('/habits/', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string) =>
            req<void>(`/habits/${id}`, { method: 'DELETE' }),
        /** Mark habit as completed on a date (idempotent) */
        complete: (id: string, date: string) =>
            req<HabitEntry>(`/habits/${id}/complete`, {
                method: 'POST',
                body: JSON.stringify({ date }),
            }),
        /** Undo completion for a specific date */
        undoComplete: (id: string, date: string) =>
            req<void>(`/habits/${id}/complete?entry_date=${date}`, { method: 'DELETE' }),
        entries: (id: string) =>
            req<HabitEntry[]>(`/habits/${id}/entries`),
    },

    expenses: {
        list: (year?: number, month?: number) => {
            const params = new URLSearchParams();
            if (year) params.set('year', String(year));
            if (month) params.set('month', String(month));
            return req<Expense[]>(`/expenses/?${params}`);
        },
        create: (data: ExpenseCreate) =>
            req<Expense>('/expenses/', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: string) =>
            req<void>(`/expenses/${id}`, { method: 'DELETE' }),
    },

    analytics: {
        streaks: () => req<HabitStreak[]>('/analytics/streaks'),
        habitStrength: () => req<{ habit_id: string, habit_name: string, habit_strength: number }[]>('/analytics/habit-strength'),
        streakHeatmap: (id: string) => req<{ habit_id: string, heatmap: { date: string, level: number }[] }>(`/analytics/streak-heatmap/${id}`),
        monthlyTotals: () => req<MonthlyTotal[]>('/analytics/expenses/monthly'),
    },

    dashboard: {
        today: () => req<DashboardToday>('/dashboard/today'),
    },

    export: {
        all: () => req<unknown>('/export/'),
    },
};
