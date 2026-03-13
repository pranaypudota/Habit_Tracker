/**
 * useHabits — custom hook for habit CRUD + completion.
 *
 * Wraps the habit Zustand store to expose clean, feature-scoped actions.
 */
import { useEffect } from 'react';
import { useHabitStore } from '../../../store/habitStore';

export function useHabits() {
    const habits = useHabitStore((s) => s.habits);
    const isLoading = useHabitStore((s) => s.isLoading);
    const error = useHabitStore((s) => s.error);
    const fetchHabits = useHabitStore((s) => s.fetchHabits);
    const createHabit = useHabitStore((s) => s.createHabit);
    const deleteHabit = useHabitStore((s) => s.deleteHabit);
    const completeHabit = useHabitStore((s) => s.completeHabit);
    const fetchEntries = useHabitStore((s) => s.fetchEntries);
    const entries = useHabitStore((s) => s.entries);

    useEffect(() => {
        fetchHabits();
    }, []);

    return {
        habits,
        isLoading,
        error,
        entries,
        fetchHabits,
        createHabit,
        deleteHabit,
        completeHabit,
        fetchEntries,
    };
}
