/**
 * HabitCard — feature component in features/habits/components/
 * Uses react-calendar-heatmap for the completion history visualization.
 */
import { useEffect, useState, useMemo } from 'react';

import type { Habit } from '../../../types';
import { useHabitStore } from '../../../store/habitStore';
import { Check, Target, ChevronDown, Trash2, Calendar } from 'lucide-react';

interface Props {
    habit: Habit;
    streak: number;
    completionRate: number;
    habitStrength: number;
    onDelete: (id: string) => void;
}

function toISO(d: Date) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

export function HabitCard({ habit, streak, completionRate, habitStrength, onDelete }: Props) {
    const EMPTY_ARRAY: any[] = useMemo(() => [], []);
    const entries = useHabitStore((s) => s.entries[habit.id] || EMPTY_ARRAY);
    const heatmaps = useHabitStore((s) => s.heatmaps);
    const completeHabit = useHabitStore((s) => s.completeHabit);

    const [completing, setCompleting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        useHabitStore.getState().fetchEntries(habit.id);
        useHabitStore.getState().fetchHeatmap(habit.id);
    }, [habit.id]);

    const today = toISO(new Date());
    const completedToday = entries.some((e) => e.date === today);
    const completedDates = new Set(entries.map((e) => e.date));

    // Grouping logic for vertical months
    const monthData = useMemo(() => {
        const months: { label: string; days: { date: string, isGhost: boolean }[]; completedCount: number; totalInMonth: number }[] = [];
        const now = new Date();

        for (let i = 0; i < 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = d.toLocaleString('default', { month: 'short' });

            const daysInMonth = [];
            const totalDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            const effectiveDays = i === 0 ? now.getDate() : totalDaysInMonth;
            let monthCompleted = 0;

            for (let day = 1; day <= totalDaysInMonth; day++) {
                const dateObj = new Date(d.getFullYear(), d.getMonth(), day);
                const isoDate = toISO(dateObj);
                daysInMonth.push({ date: isoDate, isGhost: false });

                // Only count as completed if the date is actually in our completed set
                if (completedDates.has(isoDate)) {
                    monthCompleted++;
                }
            }

            months.push({
                label: monthLabel.toLowerCase(),
                days: daysInMonth,
                completedCount: monthCompleted,
                totalInMonth: effectiveDays
            });
        }
        return months;
    }, [completedDates]);

    const handleToggle = async () => {
        if (completedToday || completing) return;
        setCompleting(true);
        try {
            await completeHabit(habit.id, today);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 1000);
        } finally {
            setCompleting(false);
        }
    };
    const isDecay = habit.tracking_model === 'decay';
    const themeColor = isDecay ? 'var(--color-accent-purple)' : 'var(--color-accent-amber)';
    const complementaryColor = isDecay ? 'var(--color-accent-amber)' : 'var(--color-accent-purple)';
    const complementaryBg = isDecay ? 'oklch(0.75 0.18 75 / 0.1)' : 'oklch(0.7 0.2 300 / 0.1)';

    return (
        <div
            className={`card ${isSuccess ? 'success-pulse' : ''}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                borderLeft: completedToday ? `4px solid ${themeColor}` : '4px solid var(--color-border)',
                cursor: 'pointer',
                userSelect: 'none'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}
            >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: '4px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronDown size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            letterSpacing: '-0.02em',
                            marginBottom: '4px',
                            color: 'var(--color-text-primary)'
                        }}>
                            {habit.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`badge ${habit.tracking_model === 'streak' ? 'badge-amber' : 'badge-purple'}`}>
                                {habit.category}
                            </span>
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--color-text-muted)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                {habit.period} • {habit.target_per_period}x
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <button
                        id={`complete-${habit.id}`}
                        className={`btn ${completedToday ? 'btn-green' : 'btn-ghost'}`}
                        style={{ padding: '0.6rem 1rem' }}
                        onClick={handleToggle}
                        disabled={completing || completedToday}
                    >
                        {completedToday ? <Check size={16} strokeWidth={3} /> : <Target size={16} />}
                        <span style={{ marginLeft: '6px' }}>{completedToday ? 'Done' : 'Mark Done'}</span>
                    </button>
                    <button
                        className="btn btn-danger"
                        style={{ padding: '0.6rem', minWidth: '40px' }}
                        onClick={() => onDelete(habit.id)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2.5rem', zIndex: 1, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '10px', backgroundColor: complementaryBg, color: complementaryColor
                    }}>
                        <Calendar size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: complementaryColor, fontFamily: 'var(--font-mono)' }}>{streak}d</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '10px', backgroundColor: 'oklch(0.72 0.18 150 / 0.1)', color: 'var(--color-accent-green)'
                    }}>
                        <Target size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>30d Rate</div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-accent-green)', fontFamily: 'var(--font-mono)' }}>{completionRate}%</div>
                    </div>
                </div>
            </div>

            <div className="habit-visualization" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem', zIndex: 1 }}>

                {/* Active Month (Always Visible) */}
                {(() => {
                    const month = monthData[0];
                    const progressPercent = Math.round((month.completedCount / month.totalInMonth) * 100) || 0;
                    return (
                        <div key={month.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {month.label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 4px' }}>//</span>
                                    <span style={{ color: progressPercent > 0 ? themeColor : 'var(--color-text-muted)' }}>{month.completedCount}/{month.totalInMonth}</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    {progressPercent}% EFFECTIVE
                                </div>
                            </div>
                            <div style={{ height: '4px', width: '100%', backgroundColor: 'oklch(1 0 0 / 0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${progressPercent}%`,
                                    backgroundColor: progressPercent > 0 ? themeColor : 'var(--color-accent-muted)',
                                    boxShadow: progressPercent > 80 ? `0 0 8px ${themeColor}` : 'none',
                                    transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }} />
                            </div>
                            <div style={{
                                display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', width: '100%', padding: '10px',
                                background: 'linear-gradient(135deg, oklch(1 0 0 / 0.02), transparent)', border: '1px solid oklch(1 0 0 / 0.04)',
                                borderRadius: '12px', backdropFilter: 'blur(4px)'
                            }}>
                                {month.days.map((day) => {
                                    const isDone = completedDates.has(day.date);
                                    const isToday = day.date === today;
                                    const intensity = heatmaps[habit.id]?.[day.date] ?? 0;
                                    return (
                                        <div key={day.date} title={day.date} className={`timeline-day intensity-${intensity} ${isToday ? 'is-today' : ''}`}
                                            // @ts-ignore
                                            style={{ '--today-color': themeColor, width: '12px', height: '24px', borderRadius: '4px', position: 'relative', opacity: isDecay && isDone ? 0.6 + (habitStrength * 0.4) : 1 } as React.CSSProperties}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {/* Collapsed Pill View */}
                {!isExpanded && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '-4px', animation: 'fadeIn 0.3s ease' }}>
                        {monthData.slice(1).map((month, idx) => {
                            const progressPercent = Math.round((month.completedCount / month.totalInMonth) * 100) || 0;
                            const color = progressPercent > 0 ? themeColor : 'var(--color-text-primary)';

                            return (
                                <div key={`pill-${idx}`} style={{
                                    display: 'flex', flexDirection: 'column', gap: '6px',
                                    backgroundColor: 'oklch(1 0 0 / 0.02)', border: '1px solid oklch(1 0 0 / 0.05)',
                                    padding: '8px 12px', borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {month.label}
                                        </span>
                                        <span style={{ color: color, fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                            {progressPercent}%
                                        </span>
                                    </div>
                                    <div style={{ height: '3px', width: '100%', backgroundColor: 'oklch(1 0 0 / 0.05)', borderRadius: '1.5px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progressPercent}%`,
                                            backgroundColor: progressPercent > 0 ? themeColor : 'var(--color-accent-muted)',
                                            boxShadow: progressPercent > 80 ? `0 0 6px ${themeColor}` : 'none',
                                            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Expanded Historical Months */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '1.25rem',
                    maxHeight: isExpanded ? '500px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    marginTop: isExpanded ? '0.5rem' : '0'
                }}>
                    {monthData.slice(1).map((month) => {
                        const progressPercent = Math.round((month.completedCount / month.totalInMonth) * 100) || 0;
                        return (
                            <div key={month.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {month.label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 4px' }}>//</span>
                                        <span style={{ color: progressPercent > 0 ? themeColor : 'var(--color-text-muted)' }}>{month.completedCount}/{month.totalInMonth}</span>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        {progressPercent}% EFFECTIVE
                                    </div>
                                </div>
                                <div style={{ height: '4px', width: '100%', backgroundColor: 'oklch(1 0 0 / 0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progressPercent}%`,
                                        backgroundColor: progressPercent > 0 ? themeColor : 'var(--color-accent-muted)',
                                        transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} />
                                </div>
                                <div style={{
                                    display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', width: '100%', padding: '10px',
                                    background: 'linear-gradient(135deg, oklch(1 0 0 / 0.01), transparent)', border: '1px solid oklch(1 0 0 / 0.02)',
                                    borderRadius: '12px'
                                }}>
                                    {month.days.map((day) => {
                                        const isDone = completedDates.has(day.date);
                                        const intensity = heatmaps[habit.id]?.[day.date] ?? 0;
                                        return (
                                            <div key={day.date} title={day.date} className={`timeline-day intensity-${intensity}`}
                                                // @ts-ignore
                                                style={{ '--today-color': themeColor, width: '12px', height: '24px', borderRadius: '4px', position: 'relative', opacity: isDecay && isDone ? 0.6 + (habitStrength * 0.4) : 1 } as React.CSSProperties}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
