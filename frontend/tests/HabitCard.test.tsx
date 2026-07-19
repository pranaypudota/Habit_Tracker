import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HabitCard } from '@/features/habits/components/HabitCard';
import type { Habit, TargetProgress } from '@/types';
import { useHabitStore } from '@/store/habitStore';

// Mock the habitStore
vi.mock('@/store/habitStore', () => ({
    useHabitStore: vi.fn(),
}));

describe('HabitCard Strength Visualization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window computed style mock
        vi.stubGlobal('getComputedStyle', (element: unknown) => {
            return {
                getPropertyValue: (prop: string) => {
                    if (prop.startsWith('--color-success-')) return 'oklch(0.7 0.18 150)';
                    return '';
                },
            };
        });
    });

    const mockDecayHabit: Habit = {
        id: '1',
        name: 'Exercise',
        category: 'Health',
        period: 'daily',
        target_per_period: 1,
        target_completions_per_day: 1,
        tracking_model: 'decay',
        goal_type: 'daily',
        count_mode: 'total',
        archived: false,
        created_at: '2026-07-19',
    };

    const mockStreakHabit: Habit = {
        id: '2',
        name: 'Meditation',
        category: 'Wellness',
        period: 'daily',
        target_per_period: 1,
        target_completions_per_day: 1,
        tracking_model: 'streak',
        goal_type: 'streak',
        count_mode: '',
        archived: false,
        created_at: '2026-07-19',
    };

    const mockTargetProgress: TargetProgress = {
        completed: 5,
        target: 7,
        percentage: 71.4,
        completed_days: 5,
        total_entries: 5,
        over_achievement_count: 0,
        period_start: '2026-07-01',
        period_end: '2026-07-31',
    };

    const mockStore = {
        entries: { '1': [] },
        heatmaps: {},
        completeHabit: vi.fn(),
    };

    it('Test 1: Decay-tracking habit displays muscle bar', () => {
        (useHabitStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: unknown) => unknown) => selector({
            ...mockStore,
            entries: { '1': [] },
        }));

        const { container } = render(
            <HabitCard
                habit={mockDecayHabit}
                streak={5}
                completionRate={71}
                habitStrength={0.75}
                targetProgress={mockTargetProgress}
                onDelete={vi.fn()}
            />
        );

        // Query for muscle bar using className
        const muscleBar = container.querySelector('.muscle-bar-fill');
        expect(muscleBar).toBeTruthy();
    });

    it('Test 2: Streak-tracking habit does NOT display muscle bar', () => {
        (useHabitStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: unknown) => unknown) => selector({
            ...mockStore,
            entries: { '2': [] },
        }));

        const { container } = render(
            <HabitCard
                habit={mockStreakHabit}
                streak={5}
                completionRate={71}
                habitStrength={0.75}
                onDelete={vi.fn()}
            />
        );

        // Muscle bar should NOT exist for streak habits
        const muscleBar = container.querySelector('.muscle-bar-fill');
        expect(muscleBar).toBeNull();
    });

    it('Test 3: Strength percentage displays correctly (0-100%)', () => {
        const testStrength = 0.6; // 60%
        (useHabitStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: unknown) => unknown) => selector({
            ...mockStore,
            entries: { '1': [] },
        }));

        const { container } = render(
            <HabitCard
                habit={mockDecayHabit}
                streak={5}
                completionRate={60}
                habitStrength={testStrength}
                targetProgress={mockTargetProgress}
                onDelete={vi.fn()}
            />
        );

        const muscleBar = container.querySelector('.muscle-bar-fill') as HTMLElement;
        expect(muscleBar).toBeTruthy();

        // Check that width is set to percentage
        expect(muscleBar.style.width).toBe('60%');
    });

    it('Test 4: Color levels use correct CSS variables (--color-success-1 through -4)', () => {
        (useHabitStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: unknown) => unknown) => selector(mockStore));

        // Test each color tier
        const testCases = [
            { strength: 0.1, expectedColor: 'var(--color-success-1)' }, // 10% <= 25%
            { strength: 0.4, expectedColor: 'var(--color-success-2)' }, // 40% <= 50%
            { strength: 0.65, expectedColor: 'var(--color-success-3)' }, // 65% <= 75%
            { strength: 0.9, expectedColor: 'var(--color-success-4)' }, // 90% > 75%
        ];

        testCases.forEach(({ strength, expectedColor }) => {
            const { container, unmount } = render(
                <HabitCard
                    habit={mockDecayHabit}
                    streak={5}
                    completionRate={Math.round(strength * 100)}
                    habitStrength={strength}
                    targetProgress={mockTargetProgress}
                    onDelete={vi.fn()}
                />
            );

            const muscleBar = container.querySelector('.muscle-bar-fill') as HTMLElement;
            expect(muscleBar).toBeTruthy();

            // Check that background contains the correct CSS variable
            expect(muscleBar.style.background).toContain(expectedColor);

            // Cleanup by unmounting
            unmount();
        });
    });

    it('Test 5: Strength 0 shows empty bar, Strength 1 shows full bar', () => {
        (useHabitStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: unknown) => unknown) => selector(mockStore));

        // Test strength 0
        const { container: container0, unmount: unmount0 } = render(
            <HabitCard
                habit={mockDecayHabit}
                streak={0}
                completionRate={0}
                habitStrength={0}
                targetProgress={mockTargetProgress}
                onDelete={vi.fn()}
            />
        );

        const muscleBar0 = container0.querySelector('.muscle-bar-fill') as HTMLElement;
        expect(muscleBar0.style.width).toBe('0%');

        // Cleanup before next render
        unmount0();

        // Test strength 1
        const { container: container1 } = render(
            <HabitCard
                habit={mockDecayHabit}
                streak={30}
                completionRate={100}
                habitStrength={1}
                targetProgress={mockTargetProgress}
                onDelete={vi.fn()}
            />
        );

        const muscleBar1 = container1.querySelector('.muscle-bar-fill') as HTMLElement;
        expect(muscleBar1.style.width).toBe('100%');
    });
});
