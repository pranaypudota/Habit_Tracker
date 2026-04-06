import { useState } from 'react';
import { X, Check, IndianRupee, ChevronDown, Utensils, Car, Play, Heart, ShoppingBag, Zap, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
    onClose: () => void;
    onAdd: (amount: number, category: string, date: string, note: string) => void;
    onAddSubscription: (name: string, amount: number, category: string, billingDay: number, startDate: string) => void;
}

const CATEGORY_MAP = {
    'Food': { icon: Utensils, color: 'var(--color-accent-amber)' },
    'Transport': { icon: Car, color: 'var(--color-accent-blue)' },
    'Entertainment': { icon: Play, color: 'var(--color-accent-purple)' },
    'Health': { icon: Heart, color: 'var(--color-accent-red)' },
    'Shopping': { icon: ShoppingBag, color: 'var(--color-accent-pink)' },
    'Utilities': { icon: Zap, color: 'var(--color-accent-cyan)' },
    'Other': { icon: MoreHorizontal, color: 'var(--color-text-muted)' }
};

const CATEGORIES = Object.keys(CATEGORY_MAP) as (keyof typeof CATEGORY_MAP)[];

export function AddExpenseModal({ onClose, onAdd, onAddSubscription }: Props) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [isSubscription, setIsSubscription] = useState(false);
    const [billingDay, setBillingDay] = useState('1');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (isSubscription) {
            if (!note.trim()) {
                setError('Subscription name is required (use Note field)');
                return;
            }
            onAddSubscription(note, num, category, parseInt(billingDay), date);
        } else {
            onAdd(num, category, date, note);
        }
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
                        {isSubscription ? 'Add Subscription' : 'Log Expense'}
                    </h2>
                    <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem', border: 'none', borderRadius: '50%' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'oklch(1 0 0 / 0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Monthly Subscription?</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Automatically carries over every month</div>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsSubscription(!isSubscription)}
                        style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: isSubscription ? 'var(--color-accent-purple)' : 'oklch(1 0 0 / 0.1)',
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 200ms ease'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: '3px',
                            left: isSubscription ? '23px' : '3px',
                            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        id="expense-category"
                                        className="input"
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            cursor: 'pointer', 
                                            width: '100%',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {(() => {
                                                const Icon = CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.icon || MoreHorizontal;
                                                return <Icon size={16} style={{ color: CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.color }} />;
                                            })()}
                                            {category}
                                        </div>
                                        <ChevronDown size={16} style={{ opacity: 0.6 }} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px]" style={{ backgroundColor: 'var(--color-bg-card)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.5rem' }}>
                                    {CATEGORIES.map((c) => {
                                        const Icon = CATEGORY_MAP[c].icon;
                                        return (
                                            <DropdownMenuItem
                                                key={c}
                                                onSelect={() => setCategory(c)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: c === category ? 'oklch(1 0 0 / 0.05)' : 'transparent',
                                                    color: c === category ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                                }}
                                            >
                                                <Icon size={16} style={{ color: CATEGORY_MAP[c].color }} />
                                                {c}
                                                {c === category && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--color-accent-green)' }} />}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div>
                            <label className="label">{isSubscription ? 'Start Date' : 'Date'}</label>
                            <input
                                id="expense-date"
                                className="input"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {isSubscription && (
                        <div>
                            <label className="label">Billing Day (1-31)</label>
                            <input 
                                className="input" 
                                type="number" 
                                min="1" max="31" 
                                value={billingDay} 
                                onChange={(e) => setBillingDay(e.target.value)} 
                            />
                        </div>
                    )}

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
                            {isSubscription ? 'Save Subscription' : 'Log Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
