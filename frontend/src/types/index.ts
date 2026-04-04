// ─── Habit ───────────────────────────────────────────────────────────────────

export interface Habit {
    id: string;
    name: string;
    category: string;
    period: "daily" | "weekly";
    target_per_period: number;
    target_completions_per_day: number;
    tracking_model: "streak" | "decay";
    archived: boolean;
    created_at: string;
}

export interface HabitCreate {
    name: string;
    category?: string;
    period?: "daily" | "weekly";
    target_per_period?: number;
    target_completions_per_day?: number;
    tracking_model?: "streak" | "decay";
}

/** Presence of a HabitEntry row = completed on that date */
export interface HabitEntry {
    id: string;
    habit_id: string;
    date: string; // "YYYY-MM-DD"
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export interface Expense {
    id: string;
    amount: number;
    category: string;
    date: string; // "YYYY-MM-DD"
    note: string;
}

export interface ExpenseCreate {
    amount: number;
    category: string;
    date: string;
    note?: string;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    category: string;
    start_date: string;
    end_date: string | null;
    status: "active" | "paused" | "inactive";
    billing_day: number;
}

export interface SubscriptionCreate {
    name: string;
    amount: number;
    category?: string;
    start_date?: string;
    billing_day?: number;
}

export interface SubscriptionUpdate {
    name?: string;
    amount?: number;
    category?: string;
    start_date?: string;
    end_date?: string | null;
    status?: "active" | "paused" | "inactive";
    billing_day?: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface HabitStreak {
    habit_id: string;
    habit_name: string;
    category: string;
    streak: number;
}

export interface MonthlyTotal {
    year: number;
    month: number;
    total: number;
}

export interface HabitStrength {
    habit_id: string;
    habit_name: string;
    strength_monthly: number;
    strength_rolling: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardToday {
    habits: Habit[];
    completed_today: string[];          // array of habit_ids
    entries_today: Record<string, HabitEntry[]>; // habit_id → entries for today
    streaks: Record<string, number>;    // habit_id → streak
    habit_strengths: Record<string, { monthly: number; rolling: number }>; // habit_id → strength
    heatmaps: Record<string, Record<string, number>>; // habit_id → { date: level }
    recent_expenses: Expense[];
    monthly_expense_total: number;
    active_subscriptions?: Subscription[];
    monthly_committed_burn?: number;
}
