import { useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { useHabitStore } from '../store/habitStore';
import { CheckCircle2, Flame, Zap, CreditCard, Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Dashboard() {
    const {
        habits, streaks: streaksData, strengths: strengthsMap, completedToday, 
        recentExpenses, monthlyExpenseTotal, monthlyBurn, isLoading, fetchAll,
    } = useHabitStore();

    useEffect(() => {
        fetchAll();
    }, []);

    const now = new Date();

    if (isLoading && habits.length === 0) {
        return (
            <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Analyzing tracker data...</div>
            </div>
        );
    }

    const completedTodayCount = completedToday.length;

    const longestStreak = Object.values(streaksData).length
        ? Math.max(...Object.values(streaksData))
        : 0;

    const todayCompletion = habits.length > 0
        ? `${completedTodayCount}/${habits.length}`
        : '0/0';

    return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Dashboard</h1>
                <p style={{ margin: '6px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
                    {now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <StatCard title="Today" value={todayCompletion} icon={CheckCircle2} accent="green" subtitle="habits completed" />
                <StatCard title="Best Streak" value={`${longestStreak}d`} icon={Flame} accent="amber" subtitle="keep it going" />
                <StatCard title="Monthly Spend" value={`₹${monthlyExpenseTotal.toLocaleString()}`} icon={CreditCard} accent="purple" subtitle={MONTH_NAMES[now.getMonth()]} />
                <StatCard title="Committed Burn" value={`₹${monthlyBurn.toLocaleString()}`} icon={Zap} accent="cyan" subtitle="monthly subs" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Top streaks */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Top Streaks
                        </h2>
                        <Link to="/habits" style={{ color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                            View all <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {habits.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {habits
                                .map((h) => ({
                                    ...h,
                                    streak: streaksData[h.id] ?? 0,
                                    strength: strengthsMap[h.id]?.rolling ?? 0
                                }))
                                .sort((a, b) => {
                                    // Sort by model then value
                                    if (a.tracking_model !== b.tracking_model) return a.tracking_model === 'streak' ? -1 : 1;
                                    return a.tracking_model === 'streak' ? b.streak - a.streak : b.strength - a.strength;
                                })
                                .slice(0, 5)
                                .map((h) => (
                                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                backgroundColor: h.tracking_model === 'streak'
                                                    ? (h.streak > 0 ? 'var(--color-accent-amber)' : 'var(--color-border)')
                                                    : (h.strength > 0.5 ? 'oklch(0.7 0.2 250)' : 'var(--color-border)')
                                            }} />
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{h.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {completedToday.includes(h.id) && (
                                                <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Done Today</span>
                                            )}
                                            {h.tracking_model === 'streak' ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--color-accent-amber)', fontSize: '0.9rem' }}>
                                                    <Flame size={14} strokeWidth={3} /> {h.streak}d
                                                </span>
                                            ) : (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'oklch(0.7 0.2 250)', fontSize: '0.9rem' }}>
                                                    <Zap size={14} strokeWidth={3} /> {Math.round(h.strength * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div style={{ padding: '1rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            No habits tracked yet.
                        </div>
                    )}
                </div>

                {/* Recent expenses */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Recent Activity
                        </h2>
                        <Link to="/expenses" style={{ color: 'var(--color-accent-purple)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                            Transactions <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {recentExpenses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentExpenses.slice(0, 4).map((e) => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="badge badge-purple" style={{ fontSize: '0.6rem' }}>{e.category}</div>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{e.note || 'Expense'}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--color-accent-purple)', fontSize: '1rem' }}>₹{Number(e.amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '1rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            No expenses logged this month.
                        </div>
                    )}
                </div>
            </div>

            {habits.length === 0 && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', borderStyle: 'dashed', backgroundColor: 'transparent' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        backgroundColor: 'var(--color-surface)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                        border: '1px solid var(--color-border)'
                    }}>
                        <Activity size={32} color="var(--color-accent-green)" />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Start your journey</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '300px', fontSize: '0.95rem' }}>
                        Create your first habit to begin tracking your daily progress and building streaks.
                    </p>
                    <Link to="/habits" className="btn btn-green" style={{ marginTop: '1.5rem' }}>
                        Create First Habit
                    </Link>
                </div>
            )}
        </div>
    );
}
