import React, { useState } from 'react';

interface Props {
    onClose: () => void;
    onAdd: (name: string, category: string, frequency: string) => void;
}

const CATEGORIES = ['Study', 'Productivity', 'Exercise', 'Health', 'Personal', 'General'];
const FREQUENCIES = ['daily', 'weekly'];

export function AddHabitModal({ onClose, onAdd }: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('General');
    const [frequency, setFrequency] = useState('daily');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        onAdd(name.trim(), category, frequency);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                    New Habit
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="label">Habit Name</label>
                        <input
                            id="habit-name"
                            className="input"
                            placeholder="e.g. Read for 30 minutes"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        {error && <div style={{ color: 'oklch(0.65 0.20 25)', fontSize: '0.75rem', marginTop: '4px' }}>{error}</div>}
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select
                            id="habit-category"
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Frequency</label>
                        <select
                            id="habit-frequency"
                            className="input"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-green">Add Habit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
