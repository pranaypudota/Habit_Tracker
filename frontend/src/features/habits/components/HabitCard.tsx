/**
 * HabitCard — feature component in features/habits/components/
 * Uses react-calendar-heatmap for the completion history visualization.
 */
import { useEffect, useState, useMemo } from 'react';

import type { Habit } from '../../../types';
import { useHabitStore } from '../../../store/habitStore';
import { Check, Target, ChevronDown, Trash2, Calendar, Flame } from 'lucide-react';

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
    const todayEntries = entries.filter((e) => e.date === today);
    const todayCount = todayEntries.length;
    const target = habit.target_completions_per_day || 1;
    const completedToday = todayCount >= target;
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

                // Count as completed if date is in entries
                // For multi-completion, any attempt today counts as "progressed" or "active"
                // But traditionally we count if target met. 
                // However, the heatmap backend now handles 'levels'.
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

    const handleToggle = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (completing) return;
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
                borderLeft: completedToday ? `4px solid ${themeColor}` : (todayCount > 0 ? `4px solid oklch(0.5 0.05 260 / 0.5)` : '4px solid var(--color-border)'),
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
                                {habit.period} • {target}x
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <button
                            id={`complete-${habit.id}`}
                            className={`btn ${completedToday ? 'btn-green' : 'btn-ghost'}`}
                            style={{ padding: '0.6rem 1rem', minWidth: '130px' }}
                            onClick={handleToggle}
                            disabled={completing}
                        >
                            {completedToday ? <Check size={16} strokeWidth={3} /> : <Target size={16} />}
                            <span style={{ marginLeft: '6px' }}>
                                {isDecay || target === 1 ? (completedToday ? 'Done' : 'Mark Done') : `${todayCount} / ${target}`}
                            </span>
                        </button>
                        {target > 1 && !completedToday && todayCount > 0 && (
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: themeColor }}>
                                {target - todayCount} REMAINING
                            </div>
                        )}
                    </div>

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
                {isDecay ? (
                    /* Muscle Model View: Total Progress Bar */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(() => {
                            const month = monthData[0];
                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {month.label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 4px' }}>//</span>
                                        <span style={{ color: themeColor }}>{month.completedCount}/{month.totalInMonth}</span>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        DAILY LOG
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="muscle-container">
                            <div className="muscle-label">
                                <div>
                                    <div className="muscle-subtext">Habit Muscle</div>
                                    {(() => {
                                        const percent = Math.round(habitStrength * 100);
                                        // Smoother color interpolation using OKLCH
                                        const getInterpolatedColor = (p: number) => {
                                            let l, c, h = 145; // Base green hue
                                            if (p <= 25) {
                                                const t = p / 25;
                                                l = 0.25 + t * (0.45 - 0.25);
                                                c = 0.05 + t * (0.12 - 0.05);
                                            } else if (p <= 50) {
                                                const t = (p - 25) / 25;
                                                l = 0.45 + t * (0.7 - 0.45);
                                                c = 0.12 + t * (0.18 - 0.12);
                                            } else if (p <= 75) {
                                                const t = (p - 50) / 25;
                                                l = 0.7 + t * (0.85 - 0.7);
                                                c = 0.18 + t * (0.22 - 0.18);
                                            } else {
                                                const t = (p - 75) / 25;
                                                l = 0.85 + t * (0.95 - 0.85);
                                                c = 0.22 + t * (0.28 - 0.22);
                                                h = 145 + t * (10 - 145); // Shift slightly toward mint
                                            }
                                            return `oklch(${l} ${c} ${h})`;
                                        };

                                        const muscleColor = getInterpolatedColor(percent);
                                        
                                        return (
                                            <div className="muscle-strength-text" style={{ color: muscleColor }}>
                                                {percent}%
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <div className="muscle-subtext">Momentum</div>
                                    <div className="muscle-momentum-val">
                                        <Flame className="fire-icon-3d" size={20} strokeWidth={3} />
                                        {streak}d
                                    </div>
                                </div>
                            </div>
                            <div className="muscle-bar-bg">
                                {(() => {
                                    const percent = Math.round(habitStrength * 100);
                                    
                                    // Utility to get interpolated color for the bar
                                    const getBarColor = (p: number) => {
                                        let l, c, h = 145;
                                        if (p <= 25) {
                                            const t = p / 25;
                                            l = 0.25 + t * (0.45 - 0.25);
                                            c = 0.05 + t * (0.12 - 0.05);
                                        } else if (p <= 50) {
                                            const t = (p - 25) / 25;
                                            l = 0.45 + t * (0.7 - 0.45);
                                            c = 0.12 + t * (0.18 - 0.12);
                                        } else if (p <= 75) {
                                            const t = (p - 50) / 25;
                                            l = 0.7 + t * (0.85 - 0.7);
                                            c = 0.18 + t * (0.22 - 0.18);
                                        } else {
                                            const t = (p - 75) / 25;
                                            l = 0.85 + t * (0.95 - 0.85);
                                            c = 0.22 + t * (0.28 - 0.22);
                                            h = 145 + t * 5; 
                                        }
                                        return { color: `oklch(${l} ${c} ${h})`, glow: `oklch(${l} ${c} ${h} / 0.5)` };
                                    };

                                    const { color, glow } = getBarColor(percent);
                                    
                                    return (
                                        <div 
                                            className="muscle-bar-fill" 
                                            style={{ 
                                                width: `${percent}%`,
                                                background: `linear-gradient(90deg, oklch(0.25 0.05 145), ${color})`,
                                                boxShadow: percent > 25 ? `0 0 10px ${glow}, 0 0 30px oklch(from ${color} l c h / 0.2)` : 'none'
                                            }} 
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Streak Model View (Default Heatmap) */
                    (() => {
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
                    })()
                )}

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
                                    {!isDecay && (
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                            {progressPercent}% EFFECTIVE
                                        </div>
                                    )}
                                </div>
                                {!isDecay && (
                                    <div style={{ height: '4px', width: '100%', backgroundColor: 'oklch(1 0 0 / 0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progressPercent}%`,
                                            backgroundColor: progressPercent > 0 ? themeColor : 'var(--color-accent-muted)',
                                            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        }} />
                                    </div>
                                )}
                                {!isDecay && (
                                    <div style={{
                                        display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', width: '100%', padding: '10px',
                                        background: 'linear-gradient(135deg, oklch(1 0 0 / 0.01), transparent)', border: '1px solid oklch(1 0 0 / 0.02)',
                                        borderRadius: '12px'
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
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
