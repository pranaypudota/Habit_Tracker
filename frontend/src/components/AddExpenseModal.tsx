import React, { useState } from 'react';

interface Props {
    onClose: () => void;
    onAdd: (amount: number, category: string, date: string, note: string) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

export function AddExpenseModal({ onClose, onAdd }: Props) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [date, setDate] = useState(todayISO());
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!amount || isNaN(parsed) || parsed <= 0) { setError('Enter a valid amount'); return; }
        onAdd(parsed, category, date, note);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                    New Expense
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="label">Amount (₹)</label>
                        <input
                            id="expense-amount"
                            className="input"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                        {error && <div style={{ color: 'oklch(0.65 0.20 25)', fontSize: '0.75rem', marginTop: '4px' }}>{error}</div>}
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select
                            id="expense-category"
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Date</label>
                        <input
                            id="expense-date"
                            className="input"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">Note (optional)</label>
                        <input
                            id="expense-note"
                            className="input"
                            placeholder="e.g. Coffee with a friend"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-purple">Add Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
