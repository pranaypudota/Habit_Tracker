import type { Expense } from '../../../types';
import { Trash2, ShoppingBag } from 'lucide-react';

interface Props {
    expense: Expense;
    onDelete: (id: string) => void;
}

export function ExpenseRow({ expense, onDelete }: Props) {
    return (
        <div
            className="card"
            style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'oklch(0.68 0.20 295 / 0.1)',
                    color: 'var(--color-accent-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <ShoppingBag size={20} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div className="badge badge-purple" style={{ fontSize: '0.6rem' }}>{expense.category}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            {new Date(expense.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                    <div style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {expense.note || 'No description'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-accent-purple)' }}>
                    ₹{Number(expense.amount).toLocaleString()}
                </div>
                <button
                    className="btn btn-danger"
                    style={{ padding: '0.5rem', minWidth: '38px', borderRadius: '10px' }}
                    onClick={() => onDelete(expense.id)}
                    title="Delete expense"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
