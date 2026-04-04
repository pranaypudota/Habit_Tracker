import { useState } from 'react';
import { X, Check, Flame, Zap, ChevronDown, Minus, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    onClose: () => void;
    onAdd: (name: string, category: string, period: "daily" | "weekly", model: "streak" | "decay", target_completions: number) => void;
}

const CATEGORIES = ['Health', 'Nutrition', 'Fitness', 'Learning', 'Mindfulness', 'Work', 'Creative', 'Social', 'Finance', 'Self-Care', 'Outdoor', 'Other'];
const PERIODS = ['daily', 'weekly'] as const;

export function AddHabitModal({ onClose, onAdd }: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Health');
    const [period, setPeriod] = useState<"daily" | "weekly">('daily');
    const [model, setModel] = useState<"streak" | "decay">('streak');
    const [targetCompletions, setTargetCompletions] = useState(1);
    const [error, setError] = useState('');

    const handleModelChange = (newModel: "streak" | "decay") => {
        setModel(newModel);
        if (newModel === 'decay') setPeriod('weekly');
        else setPeriod('daily');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Habit name is required'); return; }
        onAdd(name.trim(), category, period, model, targetCompletions);
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
                            <label className="label">Period</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        id="habit-period"
                                        className="input"
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%' }}
                                    >
                                        {period}
                                        <ChevronDown size={16} style={{ opacity: 0.6 }} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px]">
                                    {PERIODS.map((p) => (
                                        <DropdownMenuItem
                                            key={p}
                                            onSelect={() => setPeriod(p)}
                                            className={p === period ? 'bg-accent/50' : ''}
                                        >
                                            {p}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div>
                        <label className="label">Target Completions Per Day</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ padding: '0.5rem', minWidth: '40px' }}
                                onClick={() => setTargetCompletions(Math.max(1, targetCompletions - 1))}
                            >
                                <Minus size={16} />
                            </button>
                            <div style={{ 
                                flex: 1, 
                                textAlign: 'center', 
                                fontWeight: 700, 
                                fontSize: '1.1rem',
                                color: 'var(--color-text-primary)'
                            }}>
                                {targetCompletions}x
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ padding: '0.5rem', minWidth: '40px' }}
                                onClick={() => setTargetCompletions(Math.min(10, targetCompletions + 1))}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            How many times per day do you want to complete this?
                        </p>
                    </div>

                    <div>
                        <label className="label">Tracking Model</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className={`btn ${model === 'streak' ? 'btn-green' : 'btn-ghost'} `}
                                style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                onClick={() => handleModelChange('streak')}
                            >
                                <Flame size={14} strokeWidth={2.5} /> Streak
                            </button>
                            <button
                                type="button"
                                className={`btn ${model === 'decay' ? 'btn-green' : 'btn-ghost'} `}
                                style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                onClick={() => handleModelChange('decay')}
                            >
                                <Zap size={14} strokeWidth={2.5} /> Consistency
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
