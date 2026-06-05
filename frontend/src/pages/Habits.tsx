import { useState, useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';
import { HabitCard } from '../features/habits/components/HabitCard';
import { AddHabitModal } from '../features/habits/components/AddHabitModal';
import { InsightCard } from '../features/habits/components/InsightCard';
import { Plus, Leaf } from 'lucide-react';

export function Habits() {
    const {
        habits, streaks, strengths, targetProgress, insights, isLoading, createHabit, deleteHabit, fetchAll, fetchInsights,
    } = useHabitStore();

    const [showModal, setShowModal] = useState(false);
    const entries = useHabitStore((s) => s.entries);

    useEffect(() => {
        if (habits.length === 0) {
            fetchAll();
        }
        fetchInsights();
    }, []);

    const handleAdd = async (
        name: string,
        category: string,
        period: "daily" | "weekly",
        tracking_model: "streak" | "decay",
        target_completions_per_day: number,
        goal_type: "streak" | "daily" | "weekly" | "monthly",
        count_mode: "total" | "distinct_days" | "",
    ) => {
        await createHabit({
            name,
            category,
            period,
            tracking_model,
            target_completions_per_day,
            target_per_period: goal_type === 'streak' ? 1 : target_completions_per_day,
            goal_type,
            count_mode,
        });
        await fetchAll();
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Habits</h1>
                        <p style={{ margin: '6px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                            Track your daily consistency
                        </p>
                    </div>
                    <button
                        id="add-habit-btn"
                        className="btn btn-green"
                        onClick={() => setShowModal(true)}
                        style={{ padding: '0.75rem 1.25rem' }}
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Habit
                    </button>
                </div>

                {isLoading && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Loading your habits...
                    </div>
                )}

                {!isLoading && habits.length === 0 && (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', borderStyle: 'dashed', backgroundColor: 'transparent' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '20px',
                            backgroundColor: 'var(--color-surface)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                            border: '1px solid var(--color-border)'
                        }}>
                            <Leaf size={32} color="var(--color-accent-green)" />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>No habits yet</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '320px', fontSize: '0.95rem' }}>
                            Transform your life one habit at a time. Click the button above to start your first journey.
                        </p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(700px, 1fr))', gap: '1.5rem' }}>
                    {habits.map((habit) => {
                        const isDecay = habit.tracking_model === 'decay';
                        const rollingStrength = strengths[habit.id]?.rolling ?? 0;
                        const monthlyStrength = strengths[habit.id]?.monthly ?? 0;
                        
                        // Fallback rate calculation for standard habits
                        const habitEntries = entries[habit.id] || [];
                        const now = new Date();
                        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
                        const isoThirtyDaysAgo = thirtyDaysAgo.toISOString().split('T')[0];
                        const recentCompletions = habitEntries.filter(e => e.date >= isoThirtyDaysAgo).length;
                        const standardRate = Math.round((recentCompletions / 30) * 100);

                        return (
                            <HabitCard
                                key={habit.id}
                                habit={habit}
                                streak={streaks[habit.id] ?? 0}
                                habitStrength={monthlyStrength}
                                completionRate={isDecay ? Math.round(rollingStrength * 100) : standardRate}
                                targetProgress={targetProgress[habit.id]}
                                onDelete={deleteHabit}
                            />
                        );
                    })}
                </div>

                {insights.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Smart Suggestions
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
                            {insights.map((insight) => (
                                <InsightCard key={insight.habit_id} insight={insight} />
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {showModal && (
                <AddHabitModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
        </>
    );
}
