// ─── Habit ───────────────────────────────────────────────────────────────────

export interface Habit {
    id: string;
    name: string;
    category: string;
    period: "daily" | "weekly";
    target_per_period: number;
    tracking_model: "streak" | "decay";
    archived: boolean;
    created_at: string;
}

export interface HabitCreate {
    name: string;
    category?: string;
    period?: "daily" | "weekly";
    target_per_period?: number;
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

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardToday {
    habits: Habit[];
    completed_today: string[];          // array of habit_ids
    streaks: Record<string, number>;    // habit_id → streak
    habit_strengths: Record<string, number>; // habit_id → strength (0.0 - 1.0)
    recent_expenses: Expense[];
    monthly_expense_total: number;
}
