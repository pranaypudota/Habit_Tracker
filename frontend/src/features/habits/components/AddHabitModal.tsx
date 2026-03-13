import { useState } from 'react';
import { X, Check, Flame, Zap } from 'lucide-react';

interface Props {
    onClose: () => void;
    onAdd: (name: string, category: string, period: "daily" | "weekly", model: "streak" | "decay") => void;
}

const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Mindfulness', 'Nutrition', 'Other'];
const PERIODS = ['daily', 'weekly'] as const;

export function AddHabitModal({ onClose, onAdd }: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Health');
    const [period, setPeriod] = useState<"daily" | "weekly">('daily');
    const [model, setModel] = useState<"streak" | "decay">('streak');
    const [error, setError] = useState('');

    const handleModelChange = (newModel: "streak" | "decay") => {
        setModel(newModel);
        if (newModel === 'decay') setPeriod('weekly');
        else setPeriod('daily');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Habit name is required'); return; }
        onAdd(name.trim(), category, period, model);
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
                            <select id="habit-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Period</label>
                            <select
                                id="habit-period"
                                className="input"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value as "daily" | "weekly")}
                            >
                                {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
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
