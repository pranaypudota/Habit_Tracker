import { useHabitStore } from '../../../store/habitStore';
import type { HabitInsight } from '../../../types';
import { TrendingUp, X, Check } from 'lucide-react';

interface Props {
    insight: HabitInsight;
}

export function InsightCard({ insight }: Props) {
    const acceptSuggestion = useHabitStore((s) => s.acceptSuggestion);
    const dismissSuggestion = useHabitStore((s) => s.dismissSuggestion);
    const habits = useHabitStore((s) => s.habits);
    const habit = habits.find(h => h.id === insight.habit_id);

    return (
        <div className="card" style={{
            borderLeft: '4px solid var(--color-accent-amber)',
            backgroundColor: 'color-mix(in oklch, var(--color-accent-amber) 5%, var(--color-surface))',
            display: 'flex', flexDirection: 'column', gap: '1rem',
            padding: '1.25rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        backgroundColor: 'color-mix(in oklch, var(--color-accent-amber) 15%, transparent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent-amber)'
                    }}>
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                            {insight.habit_name || habit?.name || 'Goal bump suggestion'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            {insight.consecutive_periods} {insight.goal_type === 'monthly' ? 'months' : 'weeks'} over target · {insight.confidence}% average
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-ghost"
                    style={{ padding: '0.4rem' }}
                    onClick={() => dismissSuggestion(insight.habit_id, insight.type)}
                >
                    <X size={14} />
                </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {insight.reason}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                    className="btn btn-ghost"
                    style={{ flex: 1, fontSize: '0.8rem' }}
                    onClick={() => dismissSuggestion(insight.habit_id, insight.type)}
                >
                    Dismiss
                </button>
                <button
                    className="btn btn-green"
                    style={{ flex: 1, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    onClick={() => acceptSuggestion(insight.habit_id, insight.type, insight.suggested_target)}
                >
                    <Check size={14} strokeWidth={3} />
                    Set to {insight.suggested_target}
                </button>
            </div>
        </div>
    );
}
