import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { api } from '../lib/api';
import type { Expense, ExpenseCreate, Subscription, SubscriptionCreate, SubscriptionUpdate } from '../types';

interface ExpenseState {
    expenses: Expense[];
    subscriptions: Subscription[];
    monthlyCommittedBurn: number;
    isLoading: boolean;
    error: string | null;
}

interface ExpenseActions {
    fetchExpenses: (year?: number, month?: number) => Promise<void>;
    createExpense: (data: ExpenseCreate) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    
    fetchSubscriptions: (year?: number, month?: number) => Promise<void>;
    createSubscription: (data: SubscriptionCreate) => Promise<void>;
    updateSubscription: (id: string, data: SubscriptionUpdate) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
}

export type ExpenseStore = ExpenseState & ExpenseActions;

export const useExpenseStore = create<ExpenseStore>()(
    subscribeWithSelector((set) => ({
        expenses: [],
        subscriptions: [],
        monthlyCommittedBurn: 0,
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

        fetchSubscriptions: async (year, month) => {
            set({ isLoading: true, error: null });
            try {
                const subscriptions = await api.subscriptions.list(year, month);
                const burn = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);
                set({ subscriptions, monthlyCommittedBurn: burn });
            } catch (e: unknown) {
                set({ error: e instanceof Error ? e.message : String(e) });
            } finally {
                set({ isLoading: false });
            }
        },

        createSubscription: async (data) => {
            const sub = await api.subscriptions.create(data);
            set((s) => {
                const nextSubs = [sub, ...s.subscriptions];
                const burn = nextSubs.reduce((sum, sx) => sum + Number(sx.amount), 0);
                return { subscriptions: nextSubs, monthlyCommittedBurn: burn };
            });
        },

        updateSubscription: async (id, data) => {
            const updated = await api.subscriptions.update(id, data);
            set((s) => {
                const nextSubs = s.subscriptions.map((sx) => (sx.id === id ? updated : sx));
                const burn = nextSubs.reduce((sum, sx) => sum + Number(sx.amount), 0);
                return { subscriptions: nextSubs, monthlyCommittedBurn: burn };
            });
        },

        deleteSubscription: async (id) => {
            await api.subscriptions.delete(id);
            set((s) => {
                const nextSubs = s.subscriptions.filter((sx) => sx.id !== id);
                const burn = nextSubs.reduce((sum, sx) => sum + Number(sx.amount), 0);
                return { subscriptions: nextSubs, monthlyCommittedBurn: burn };
            });
        },
    }))
);
