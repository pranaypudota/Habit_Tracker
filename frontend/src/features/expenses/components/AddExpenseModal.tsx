import { useState } from 'react';
import { X, Check, IndianRupee } from 'lucide-react';

interface Props {
    onClose: () => void;
    onAdd: (amount: number, category: string, date: string, note: string) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];

export function AddExpenseModal({ onClose, onAdd }: Props) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        onAdd(num, category, date, note);
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
                        Log Expense
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem', border: 'none', borderRadius: '50%' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    <div>
                        <label className="label">Amount</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                <IndianRupee size={16} />
                            </div>
                            <input
                                id="expense-amount"
                                className="input"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                                autoFocus
                            />
                        </div>
                        {error && <div style={{ color: 'var(--color-accent-amber)', fontSize: '0.75rem', marginTop: '6px', fontWeight: 500 }}>{error}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label className="label">Category</label>
                            <select id="expense-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
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
                    </div>

                    <div>
                        <label className="label">Note (Optional)</label>
                        <input
                            id="expense-note"
                            className="input"
                            type="text"
                            placeholder="Lunch at..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-purple" style={{ flex: 2 }}>
                            <Check size={18} strokeWidth={3} />
                            Log Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
