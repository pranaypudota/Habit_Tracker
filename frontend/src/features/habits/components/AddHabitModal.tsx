import { useState } from 'react';
import { X, Check, Minus, Plus, ChevronDown, Target } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    onClose: () => void;
    onAdd: (
        name: string,
        category: string,
        period: "daily" | "weekly",
        tracking_model: "streak" | "decay",
        target: number,
        goal_type: "streak" | "daily" | "weekly" | "monthly",
        count_mode: "total" | "distinct_days" | "",
    ) => void;
}

const CATEGORIES = ['Health', 'Nutrition', 'Fitness', 'Learning', 'Mindfulness', 'Work', 'Creative', 'Social', 'Finance', 'Self-Care', 'Outdoor', 'Other'];

const GOAL_TYPES = [
    { value: 'streak', label: 'Streak (once/day)' },
    { value: 'daily', label: 'Daily (N times/day)' },
    { value: 'weekly', label: 'Weekly (N times/week)' },
    { value: 'monthly', label: 'Monthly (N times/month)' },
] as const;

const COUNT_MODES = [
    { value: 'total', label: 'Total times' },
    { value: 'distinct_days', label: 'Distinct days' },
] as const;

export function AddHabitModal({ onClose, onAdd }: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Health');
    const [goalType, setGoalType] = useState<"streak" | "daily" | "weekly" | "monthly">('streak');
    const [countMode, setCountMode] = useState<"total" | "distinct_days">('total');
    const [target, setTarget] = useState(1);
    const [error, setError] = useState('');

    const showCountMode = goalType === 'weekly' || goalType === 'monthly';

    const getTargetLabel = () => {
        switch (goalType) {
            case 'daily': return `How many times today?`;
            case 'weekly': return countMode === 'distinct_days'
                ? `How many days this week?`
                : `How many times this week?`;
            case 'monthly': return countMode === 'distinct_days'
                ? `How many days this month?`
                : `How many times this month?`;
            default: return `Minimum completions per day`;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Habit name is required'); return; }
        const period = goalType === 'weekly' ? 'weekly' as const : 'daily' as const;
        onAdd(
            name.trim(),
            category,
            period,
            'streak',
            target,
            goalType,
            goalType === 'streak' || goalType === 'daily' ? '' : countMode,
        );
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box glass animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Create Habit
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem', border: 'none', borderRadius: '50%' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    <div>
                        <label className="label">Habit Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                <Check size={16} />
                            </div>
                            <input
                                id="habit-name"
                                className="input"
                                type="text"
                                placeholder="e.g. Read for 30 minutes"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                                autoFocus
                            />
                        </div>
                        {error && <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.75rem', marginTop: '6px', fontWeight: 500 }}>{error}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label className="label">Category</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        id="habit-category"
                                        className="input"
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%' }}
                                    >
                                        {category}
                                        <ChevronDown size={16} style={{ opacity: 0.6 }} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px]">
                                    {CATEGORIES.map((c) => (
                                        <DropdownMenuItem
                                            key={c}
                                            onSelect={() => setCategory(c)}
                                            className={c === category ? 'bg-accent/50' : ''}
                                        >
                                            {c}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div>
                            <label className="label">Goal Type</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        id="habit-goal-type"
                                        className="input"
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%' }}
                                    >
                                        {GOAL_TYPES.find(g => g.value === goalType)?.label}
                                        <ChevronDown size={16} style={{ opacity: 0.6 }} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[250px]">
                                    {GOAL_TYPES.map((g) => (
                                        <DropdownMenuItem
                                            key={g.value}
                                            onSelect={() => setGoalType(g.value)}
                                            className={g.value === goalType ? 'bg-accent/50' : ''}
                                        >
                                            {g.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {showCountMode && (
                        <div>
                            <label className="label">How to count?</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        id="habit-count-mode"
                                        className="input"
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%' }}
                                    >
                                        {COUNT_MODES.find(m => m.value === countMode)?.label}
                                        <ChevronDown size={16} style={{ opacity: 0.6 }} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[250px]">
                                    {COUNT_MODES.map((m) => (
                                        <DropdownMenuItem
                                            key={m.value}
                                            onSelect={() => setCountMode(m.value)}
                                            className={m.value === countMode ? 'bg-accent/50' : ''}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{m.label}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                                    {m.value === 'total'
                                                        ? 'Count every completion (can batch same day)'
                                                        : 'Count unique days (at least 1 completion per day)'}
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    <div>
                        <label className="label">{getTargetLabel()}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ padding: '0.5rem', minWidth: '40px' }}
                                onClick={() => setTarget(Math.max(1, target - 1))}
                            >
                                <Minus size={16} />
                            </button>
                            <div style={{ 
                                flex: 1, 
                                textAlign: 'center', 
                                fontWeight: 700, 
                                fontSize: '1.1rem',
                                color: 'var(--color-text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}>
                                <Target size={16} />
                                {target}x
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ padding: '0.5rem', minWidth: '40px' }}
                                onClick={() => setTarget(Math.min(30, target + 1))}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-green" style={{ flex: 2 }}>
                            <Check size={18} strokeWidth={3} />
                            Start Tracking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
