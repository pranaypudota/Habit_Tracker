import type {
    Habit, HabitCreate, HabitEntry,
    Expense, ExpenseCreate,
    Subscription, SubscriptionCreate, SubscriptionUpdate,
    HabitStreak, MonthlyTotal,
    DashboardToday, HabitStrength, HabitInsight,
    AuthStatus, TokenResponse
} from '../types';

const BASE = 'http://localhost:8000/api/v1';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
    // Get token directly from localStorage to skip circular dependency
    // (Zustand state persists to 'auth-storage')
    const rawVal = localStorage.getItem('auth-storage');
    const token = rawVal ? JSON.parse(rawVal).state?.token : null;

    const headers: Record<string, string> = { 
        'Content-Type': 'application/json' 
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        headers,
        ...options,
    });

    if (!res.ok) {
        // Handle 401 Unauthorized globally
        if (res.status === 401) {
             // Dispatch a custom event so the UI can force re-lock
             window.dispatchEvent(new Event('auth-unauthorized'));
        }

        const msg = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${msg}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export const api = {
    auth: {
        status: () => req<AuthStatus>('/auth/status'),
        setup: (pin: string) => 
            req<{ status: string, recovery_key: string }>('/auth/setup', { 
                method: 'POST', body: JSON.stringify({ pin }) 
            }),
        login: (pin: string) => 
            req<TokenResponse>('/auth/login', { 
                method: 'POST', body: JSON.stringify({ pin }) 
            }),
        changePin: (current: string, next: string) => 
            req<TokenResponse>('/auth/change-pin', { 
                method: 'POST', body: JSON.stringify({ current_pin: current, new_pin: next }) 
            }),
        recover: (key: string, next: string) => 
            req<TokenResponse>('/auth/recover', { 
                method: 'POST', body: JSON.stringify({ recovery_key: key, new_pin: next }) 
            }),
    },
    habits: {
        list: (includeArchived = false) =>
            req<Habit[]>(`/habits/?include_archived=${includeArchived}`),
        create: (data: HabitCreate) =>
            req<Habit>('/habits/', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<Habit>) =>
            req<Habit>(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id: string) =>
            req<void>(`/habits/${id}`, { method: 'DELETE' }),
        /** Mark habit as completed on a date (idempotent).
         * Returns the entry + over-achievement info if goal was exceeded. */
        complete: (id: string, date: string) =>
            req<HabitEntry & { is_over_achievement?: boolean; over_achievement_warning?: string }>(`/habits/${id}/complete`, {
                method: 'POST',
                body: JSON.stringify({ date }),
            }),
        /** Undo completion for a specific date */
        undoComplete: (id: string, date: string) =>
            req<void>(`/habits/${id}/complete?entry_date=${date}`, { method: 'DELETE' }),
        entries: (id: string) =>
            req<HabitEntry[]>(`/habits/${id}/entries`),
        acceptSuggestion: (id: string, type: string, newTarget: number) =>
            req<{ status: string }>(`/habits/${id}/suggestions/${type}/accept?new_target=${newTarget}`, { method: 'POST' }),
        dismissSuggestion: (id: string, type: string) =>
            req<{ status: string }>(`/habits/${id}/suggestions/${type}/dismiss`, { method: 'POST' }),
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

    subscriptions: {
        list: (year?: number, month?: number) => {
            const params = new URLSearchParams();
            if (year) params.set('year', String(year));
            if (month) params.set('month', String(month));
            return req<Subscription[]>(`/subscriptions/?${params}`);
        },
        create: (data: SubscriptionCreate) =>
            req<Subscription>('/subscriptions/', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: SubscriptionUpdate) =>
            req<Subscription>(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id: string) =>
            req<void>(`/subscriptions/${id}`, { method: 'DELETE' }),
    },

    analytics: {
        streaks: () => req<HabitStreak[]>('/analytics/streaks'),
        habitStrength: () => req<HabitStrength[]>('/analytics/habit-strength'),
        streakHeatmap: (id: string) => req<{ habit_id: string, heatmap: { date: string, level: number }[] }>(`/analytics/streak-heatmap/${id}`),
        monthlyTotals: () => req<MonthlyTotal[]>('/analytics/expenses/monthly'),
        insights: () => req<HabitInsight[]>('/analytics/insights'),
    },

    dashboard: {
        today: () => req<DashboardToday>('/dashboard/today'),
    },

    export: {
        all: () => req<unknown>('/export/'),
    },
};
