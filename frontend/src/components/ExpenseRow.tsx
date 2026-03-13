import type { Expense } from '../types';

interface Props {
    expense: Expense;
    onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
    Food: 'amber',
    Transport: 'green',
    Entertainment: 'purple',
    Health: 'green',
    Shopping: 'purple',
    Utilities: 'amber',
    Other: 'green',
};

export function ExpenseRow({ expense, onDelete }: Props) {
    const badgeClass = `badge badge-${categoryColors[expense.category] ?? 'green'}`;
    const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                transition: 'border-color 150ms ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-accent-purple)' }}>
                        ₹{Number(expense.amount).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {formattedDate}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={badgeClass}>{expense.category}</span>
                    {expense.note && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {expense.note}
                        </span>
                    )}
                </div>
            </div>
            <button
                className="btn btn-danger"
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => onDelete(expense.id)}
                title="Delete expense"
            >
                ✕
            </button>
        </div>
    );
}
