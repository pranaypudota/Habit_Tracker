import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../lib/api';
import type { Expense, ExpenseCreate } from '../types';

interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;
}

interface ExpenseActions {
    fetchExpenses: (year?: number, month?: number) => Promise<void>;
    createExpense: (data: ExpenseCreate) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
}

export type ExpenseStore = ExpenseState & ExpenseActions;

export const useExpenseStore = create<ExpenseStore>()(
    subscribeWithSelector((set) => ({
        expenses: [],
        isLoading: false,
        error: null,

        fetchExpenses: async (year, month) => {
            set({ isLoading: true, error: null });
            try {
                const expenses = await api.expenses.list(year, month);
                set({ expenses });
            } catch (e: unknown) {
                set({ error: e instanceof Error ? e.message : String(e) });
            } finally {
                set({ isLoading: false });
            }
        },

        createExpense: async (data) => {
            const expense = await api.expenses.create(data);
            set((s) => ({ expenses: [expense, ...s.expenses] }));
        },

        deleteExpense: async (id) => {
            await api.expenses.delete(id);
            set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
        },
    }))
);
