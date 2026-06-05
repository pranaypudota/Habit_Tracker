import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHabitStore } from '../habitStore';
import { api } from '../../lib/api';

// Mock the API library
vi.mock('../../lib/api', () => ({
    api: {
        dashboard: {
            today: vi.fn(),
        },
        habits: {
            create: vi.fn(),
            delete: vi.fn(),
            complete: vi.fn(),
            entries: vi.fn(),
        },
        analytics: {
            streakHeatmap: vi.fn(),
        },
    },
}));

describe('HabitStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useHabitStore.setState({
            habits: [],
            entries: {},
            heatmaps: {},
            streaks: {},
            isLoading: false,
            error: null,
        });
        vi.clearAllMocks();
    });

    it('should create a habit and update state', async () => {
        const mockHabit = { id: '1', name: 'Test Habit', category: 'General' };
        (api.habits.create as any).mockResolvedValue(mockHabit);

        await useHabitStore.getState().createHabit({ name: 'Test Habit' } as any);

        expect(api.habits.create).toHaveBeenCalled();
        expect(useHabitStore.getState().habits).toContainEqual(mockHabit);
    });

    it('should mark habit as completed and update local entries', async () => {
        const habitId = '1';
        const date = '2026-04-19';
        const mockEntry = { id: 'e1', habit_id: habitId, date };
        
        (api.habits.complete as any).mockResolvedValue(mockEntry);
        (api.analytics.streakHeatmap as any).mockResolvedValue({ 
            habit_id: habitId, 
            heatmap: [{ date, level: 1 }] 
        });
        (api.dashboard.today as any).mockResolvedValue({ 
            habits: [{ id: habitId, name: 'Water' }],
            streaks: { [habitId]: 1 },
            completed_today: [habitId],
            entries_today: { [habitId]: [mockEntry] },
            heatmaps: { [habitId]: { [date]: 1 } }
        });

        await useHabitStore.getState().completeHabit(habitId, date);

        expect(api.habits.complete).toHaveBeenCalledWith(habitId, date);
        expect(useHabitStore.getState().entries[habitId]).toContainEqual(mockEntry);
        expect(useHabitStore.getState().heatmaps[habitId][date]).toBe(1);
    });

    it('should handle errors during fetchAll', async () => {
        const errorMsg = 'Failed to fetch dashboard';
        (api.dashboard.today as any).mockRejectedValue(new Error(errorMsg));

        await useHabitStore.getState().fetchAll();

        expect(useHabitStore.getState().isLoading).toBe(false);
        expect(useHabitStore.getState().error).toBe(errorMsg);
    });
});
