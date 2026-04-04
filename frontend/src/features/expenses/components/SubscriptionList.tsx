import { Trash2 } from 'lucide-react';
import type { Subscription } from '../../../types';

interface Props {
    subscriptions: Subscription[];
    onDelete: (id: string) => void;
}

export function SubscriptionList({ subscriptions, onDelete }: Props) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
            {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                    <div 
                        key={sub.id} 
                        className="animate-in fade-in-0 zoom-in-95" 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '0.5rem', 
                            borderRadius: '8px', 
                            backgroundColor: 'oklch(1 0 0 / 0.03)',
                            transition: 'all 300ms ease-out'
                        }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{sub.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Day {sub.billing_day} &bull; {sub.category}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-accent-purple)' }}>
                                &#x20B9;{Number(sub.amount).toLocaleString()}
                            </div>
                            <button
                                className="btn btn-ghost"
                                style={{ color: 'var(--color-accent-red)', padding: '4px' }}
                                onClick={() => onDelete(sub.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    No active subscriptions.
                </p>
            )}
        </div>
    );
}
