/**
 * useExpenses — custom hook for expense CRUD.
 */
import { useEffect } from 'react';
import { useExpenseStore } from '../../../store/expenseStore';

export function useExpenses(year?: number, month?: number) {
    const expenses = useExpenseStore((s) => s.expenses);
    const isLoading = useExpenseStore((s) => s.isLoading);
    const error = useExpenseStore((s) => s.error);
    const fetchExpenses = useExpenseStore((s) => s.fetchExpenses);
    const createExpense = useExpenseStore((s) => s.createExpense);
    const deleteExpense = useExpenseStore((s) => s.deleteExpense);

    useEffect(() => {
        fetchExpenses(year, month);
    }, [year, month]);

    return {
        expenses,
        isLoading,
        error,
        fetchExpenses,
        createExpense,
        deleteExpense,
    };
}
