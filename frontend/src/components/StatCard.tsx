import React from 'react';

interface Props {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    accent: 'green' | 'amber' | 'purple' | 'cyan';
    subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, accent, subtitle }: Props) {
    const accentColor = `var(--color-accent-${accent})`;

    return (
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                opacity: 0.05,
                filter: 'blur(20px)',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{
                    padding: '0.625rem',
                    borderRadius: '12px',
                    backgroundColor: 'oklch(1 0 0 / 0.03)',
                    border: '1px solid var(--color-border)',
                    color: accentColor
                }}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                {subtitle && (
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-muted)',
                        backgroundColor: 'oklch(1 0 0 / 0.02)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        {subtitle}
                    </span>
                )}
            </div>

            <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    {title}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    {value}
                </div>
            </div>
        </div>
    );
}
