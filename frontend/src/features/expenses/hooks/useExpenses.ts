/**
 * useExpenses — custom hook for expense CRUD.
 */
import { useEffect } from 'react';
import { useExpenseStore } from '../../../store/expenseStore';

export function useExpenses(year?: number, month?: number) {
    const expenses = useExpenseStore((s) => s.expenses);
    const subscriptions = useExpenseStore((s) => s.subscriptions);
    const burn = useExpenseStore((s) => s.monthlyCommittedBurn);
    const isLoading = useExpenseStore((s) => s.isLoading);
    const error = useExpenseStore((s) => s.error);
    const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
    const fetchSubscriptions = useExpenseStore((s) => s.fetchSubscriptions);
    const createExpense = useExpenseStore((s) => s.createExpense);
    const deleteExpense = useExpenseStore((s) => s.deleteExpense);
    const createSubscription = useExpenseStore((s) => s.createSubscription);
    const updateSubscription = useExpenseStore((s) => s.updateSubscription);
    const deleteSubscription = useExpenseStore((s) => s.deleteSubscription);

    useEffect(() => {
        fetchExpenses(year, month);
        fetchSubscriptions(year, month);
    }, [year, month]);

    return {
        expenses,
        subscriptions,
        burn,
        isLoading,
        error,
        fetchExpenses,
        fetchSubscriptions,
        createExpense,
        deleteExpense,
        createSubscription,
        updateSubscription,
        deleteSubscription,
    };
}
