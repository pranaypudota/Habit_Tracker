/**
 * HabitCard — feature component in features/habits/components/
 * Uses react-calendar-heatmap for the completion history visualization.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

import type { Habit, TargetProgress } from '../../../types';
import { useHabitStore } from '../../../store/habitStore';
import { Check, Target, Trash2, Calendar, Flame, TrendingUp } from 'lucide-react';
import { TooltipSimple } from '@/components/ui/tooltip';

const categoryColors: Record<string, string> = {
  'Health': 'badge-cyan',
  'Nutrition': 'badge-green',
  'Fitness': 'badge-red',
  'Learning': 'badge-blue',
  'Mindfulness': 'badge-teal',
  'Work': 'badge-indigo',
  'Creative': 'badge-pink',
  'Social': 'badge-lavender',
  'Finance': 'badge-emerald',
  'Self-Care': 'badge-coral',
  'Outdoor': 'badge-lime',
  'Other': 'badge-gray',
};

interface Props {
    habit: Habit;
    streak: number;
    completionRate: number;
    habitStrength: number;
    targetProgress?: TargetProgress;
    onDelete: (id: string) => void;
}

function toISO(d: Date) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}

export function HabitCard({ habit, streak, completionRate, habitStrength, targetProgress, onDelete }: Props) {
    const EMPTY_ARRAY: any[] = useMemo(() => [], []);
    const entries = useHabitStore((s) => s.entries[habit.id] || EMPTY_ARRAY);
    const heatmaps = useHabitStore((s) => s.heatmaps);
    const completeHabit = useHabitStore((s) => s.completeHabit);

    const [completing, setCompleting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showOverConfirm, setShowOverConfirm] = useState(false);


    const today = toISO(new Date());
    const todayEntries = entries.filter((e) => e.date === today);
    const todayCount = todayEntries.length;
    const target = habit.target_completions_per_day || 1;
    const completedToday = todayCount >= target;
    const completedDates = new Set(entries.map((e) => e.date));

    const isOverThreshold = habit.goal_type !== 'streak' && targetProgress
        ? targetProgress.completed >= (targetProgress.target || habit.target_per_period)
        : completedToday;

    const handleToggle = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (completing) return;

        if (habit.goal_type !== 'streak' && isOverThreshold) {
            setShowOverConfirm(true);
            return;
        }

        await doComplete();
    };

    const doComplete = async () => {
        setCompleting(true);
        setShowOverConfirm(false);
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
    // Stats and highlights now stay true to the habit's theme color
    const complementaryColor = themeColor;
    const complementaryBg = isDecay ? 'color-mix(in oklch, var(--color-accent-purple) 15%, transparent)' : 'color-mix(in oklch, var(--color-accent-amber) 15%, transparent)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: completedToday ? 1 : 0.9, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{
                duration: 0.6,
                type: "spring",
                bounce: 0.4
            }}
            className={`card ${isSuccess ? 'success-pulse' : ''}`}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                border: '1px solid var(--color-border)',
                borderLeft: `6px solid ${themeColor}`,
                userSelect: 'none',
                backgroundColor: 'var(--color-surface)',
            }}
        >
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}
            >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
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
                            <span className={`badge ${categoryColors[habit.category] || categoryColors.default}`}>
                                {habit.category}
                            </span>
                            {habit.goal_type === 'daily' && (
                                <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>daily</span>
                            )}
                            {habit.goal_type === 'weekly' && (
                                <span className="badge badge-teal" style={{ fontSize: '0.6rem' }}>
                                    {habit.count_mode === 'distinct_days' ? 'weekly·days' : 'weekly'}
                                </span>
                            )}
                            {habit.goal_type === 'monthly' && (
                                <span className="badge badge-indigo" style={{ fontSize: '0.6rem' }}>
                                    {habit.count_mode === 'distinct_days' ? 'monthly·days' : 'monthly'}
                                </span>
                            )}
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
                            className={`btn ${isOverThreshold ? 'btn-outline' : completedToday ? 'btn-ghost' : 'btn-green'}`}
                            style={{ 
                                padding: '0.6rem 1rem', 
                                minWidth: '130px',
                                opacity: (completedToday && habit.goal_type === 'streak') ? 0.5 : 1,
                                cursor: (completedToday && habit.goal_type === 'streak') ? 'not-allowed' : 'pointer',
                                filter: (completedToday && habit.goal_type === 'streak') ? 'grayscale(1)' : 'none',
                                borderColor: isOverThreshold ? 'var(--color-accent-amber)' : undefined,
                            }}
                            onClick={handleToggle}
                            disabled={completing || (completedToday && habit.goal_type === 'streak')}
                        >
                            {isOverThreshold ? <Flame size={16} strokeWidth={3} style={{ color: 'var(--color-accent-amber)' }} /> :
                             completedToday ? <Check size={16} strokeWidth={3} /> :
                             <Target size={16} />}
                            <span style={{ marginLeft: '6px' }}>
                                {isOverThreshold ? `+${habit.goal_type === 'daily' ? 1 : '1'}` :
                                 completedToday ? 'Done' :
                                 isDecay || target === 1 ? 'Mark Done' : `${todayCount} / ${target}`}
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
                {habit.goal_type === 'streak' ? (
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
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '10px', backgroundColor: 'oklch(0.72 0.18 220 / 0.1)', color: 'var(--color-accent-blue)'
                        }}>
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {habit.goal_type === 'daily' ? 'Today' : `This ${habit.goal_type}`}
                            </div>
                            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)' }}>
                                {targetProgress?.completed ?? 0}/{targetProgress?.target ?? habit.target_per_period}
                                {habit.count_mode === 'distinct_days' && (
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, marginLeft: '4px' }}>days</span>
                                )}
                                {targetProgress && targetProgress.completed > targetProgress.target && (
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, marginLeft: '6px', color: 'var(--color-accent-amber)' }}>
                                        +{targetProgress.completed - targetProgress.target} over
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
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
                {(() => {
                    if (isDecay) {
                        const month = monthData[0];
                        const percent = Math.round(habitStrength * 100);
                        const getInterpolatedColor = (p: number) => {
                            if (p <= 25) return 'var(--color-success-1)';
                            if (p <= 50) return 'var(--color-success-2)';
                            if (p <= 75) return 'var(--color-success-3)';
                            return 'var(--color-success-4)';
                        };
                        const getBarColor = (p: number) => {
                            if (p <= 25) return { color: 'var(--color-success-1)', glow: 'color-mix(in oklch, var(--color-success-1) 40%, transparent)' };
                            if (p <= 50) return { color: 'var(--color-success-2)', glow: 'color-mix(in oklch, var(--color-success-2) 40%, transparent)' };
                            if (p <= 75) return { color: 'var(--color-success-3)', glow: 'color-mix(in oklch, var(--color-success-3) 40%, transparent)' };
                            return { color: 'var(--color-success-4)', glow: 'color-mix(in oklch, var(--color-success-4) 40%, transparent)' };
                        };
                        const muscleColor = getInterpolatedColor(percent);
                        const { color, glow } = getBarColor(percent);
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {month.label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 4px' }}>//</span>
                                        <span style={{ color: themeColor }}>{month.completedCount}/{month.totalInMonth}</span>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        DAILY LOG
                                    </div>
                                </div>
                                <div className="muscle-container container-main" style={{ position: 'relative', overflow: 'hidden' }}>
                                    <div className="muscle-label">
                                        <div>
                                            <div className="muscle-subtext">Habit Muscle</div>
                                            <div className="muscle-strength-text" style={{ color: muscleColor }}>
                                                {percent}%
                                            </div>
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
                                        <div
                                            className="muscle-bar-fill"
                                            style={{
                                                width: `${percent}%`,
                                                background: `linear-gradient(90deg, var(--color-success-1), ${color})`,
                                                boxShadow: percent > 25 ? `0 4px 12px ${glow}` : 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (isTargetGoal) {
                        const pct = targetProgress.percentage;
                        const completed = targetProgress.completed;
                        const target = targetProgress.target;
                        const isDistinct = habit.count_mode === 'distinct_days';
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {habit.goal_type === 'daily' ? 'TODAY' : `THIS ${habit.goal_type.toUpperCase()}`}
                                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 4px' }}>//</span>
                                        <span style={{ color: pct >= 100 ? 'var(--color-accent-green)' : 'var(--color-accent-blue)' }}>
                                            {completed}/{target}{isDistinct ? ' days' : ''}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                        {pct >= 100 ? '⭐ ' : ''}{pct.toFixed(0)}% COMPLETE
                                    </div>
                                </div>
                                <div style={{ height: '10px', width: '100%', backgroundColor: 'oklch(1 0 0 / 0.08)', borderRadius: '5px', overflow: 'hidden', border: '1px solid oklch(1 0 0 / 0.05)' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(pct, 100)}%`,
                                        backgroundColor: pct >= 100 ? 'var(--color-success-3)' : 'var(--color-accent-blue)',
                                        boxShadow: pct >= 100 ? '0 0 8px var(--color-success-4)' : 'none',
                                        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} />
                                </div>
                                {isDistinct && targetProgress.completed_days > 0 && (
                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 500, padding: '0 4px' }}>
                                        {targetProgress.completed_days} unique {targetProgress.completed_days === 1 ? 'day' : 'days'} · {targetProgress.total_entries} total {targetProgress.total_entries === 1 ? 'completion' : 'completions'}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Default: Streak Model View (Heatmap)
                    const month = monthData[0];
                    const progressPercent = Math.round((month.completedCount / month.totalInMonth) * 100) || 0;
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {month.label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, margin: '0 4px' }}>//</span>
                                    <span style={{ color: progressPercent > 0 ? themeColor : 'var(--color-text-muted)' }}>{month.completedCount}/{month.totalInMonth}</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    {progressPercent}% EFFECTIVE
                                </div>
                            </div>
                            <div style={{ height: '8px', width: '100%', backgroundColor: 'oklch(1 0 0 / 0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px', border: '1px solid oklch(1 0 0 / 0.05)' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${progressPercent}%`,
                                    backgroundColor: progressPercent > 0 ? 'var(--color-success-3)' : 'var(--color-accent-muted)',
                                    boxShadow: progressPercent > 80 ? '0 0 8px var(--color-success-4)' : 'none',
                                    transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }} />
                            </div>
                            <div className="premium-container container-main">
                                <div style={{
                                    display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', width: '100%',
                                }}>
                                    {month.days.map((day) => {
                                        const isDone = completedDates.has(day.date);
                                        const isToday = day.date === today;
                                        const intensityMap = heatmaps[habit.id]?.[day.date] ?? 0;
                                        const intensityClass = `intensity-${intensityMap}`;
                                        return (
                                            <TooltipSimple key={day.date} label={`${day.date}${isDone ? ' (Completed)' : ''}`}>
                                                <div className={`timeline-day ${intensityClass} ${isToday ? 'is-today' : ''}`}
                                                    // @ts-ignore
                                                    style={{ '--today-color': themeColor, width: '12px', height: '24px', borderRadius: '4px', position: 'relative', opacity: isDecay && isDone ? 0.6 + (habitStrength * 0.4) : 1 } as React.CSSProperties}
                                                />
                                            </TooltipSimple>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Historical Pill View */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '-4px' }}>
                    {monthData.slice(1).map((month, idx) => {
                        const progressPercent = Math.round((month.completedCount / month.totalInMonth) * 100) || 0;
                        const color = progressPercent > 0 ? themeColor : 'var(--color-text-primary)';

                        return (
                            <div key={`pill-${idx}`} className="premium-container" style={{
                                display: 'flex', flexDirection: 'column', gap: '6px',
                                padding: '8px 12px'
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
                                        backgroundColor: progressPercent > 0 ? 'var(--color-success-3)' : 'var(--color-accent-muted)',
                                        boxShadow: progressPercent > 80 ? '0 0 6px var(--color-success-4)' : 'none',
                                        transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {showOverConfirm && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(12px)', borderRadius: '16px', zIndex: 10,
                }} onClick={() => setShowOverConfirm(false)}>
                    <div className="glass" style={{
                        padding: '1.5rem 2rem', borderRadius: '16px', maxWidth: '320px', textAlign: 'center',
                        boxShadow: '0 0 40px oklch(0.7 0.2 60 / 0.15)',
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⭐</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                            Over-Achiever!
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                            You've already hit your goal of{' '}
                            <strong>{habit.goal_type === 'daily' ? target : (targetProgress?.target || habit.target_per_period)}</strong>
                            {habit.goal_type === 'daily' ? ' times today' : habit.count_mode === 'distinct_days' ? ' days' : ` times this ${habit.goal_type}`}.
                            <br />Want to go beyond?
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowOverConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-green" style={{ flex: 1 }} onClick={doComplete}>
                                Go Beyond
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
