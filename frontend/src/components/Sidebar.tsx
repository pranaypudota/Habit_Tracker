import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Leaf, CreditCard, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: Leaf },
    { to: '/expenses', label: 'Expenses', icon: CreditCard },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            style={{
                width: isCollapsed ? '80px' : '240px',
                height: '100vh',
                backgroundColor: 'var(--color-surface)',
                backdropFilter: 'blur(12px)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                padding: isCollapsed ? '2rem 1rem' : '2rem 1.25rem',
                flexShrink: 0,
                transition: 'width 300ms cubic-bezier(0.2, 0.8, 0.2, 1), padding 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                position: 'relative',
            }}
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: '-14px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-border)',
                    border: '1px solid oklch(1 0 0 / 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    zIndex: 50,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-green)';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.borderColor = 'var(--color-accent-green)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.borderColor = 'oklch(1 0 0 / 0.15)';
                }}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <Zap size={28} color="white" fill="white" strokeWidth={1} style={{ flexShrink: 0, opacity: 0.9 }} />
                {!isCollapsed && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: isCollapsed ? 0 : 1, transition: 'opacity 200ms ease' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}>
                            HabitOS
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Local · Private
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {navLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        style={{
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                        }}
                        title={isCollapsed ? label : undefined}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                                {!isCollapsed && (
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {label}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div style={{ marginTop: 'auto', padding: '1rem', borderRadius: '12px', backgroundColor: 'oklch(1 0 0 / 0.03)', fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Personal Data</div>
                    Locked to your device
                </div>
            )}
        </aside>
    );
}
