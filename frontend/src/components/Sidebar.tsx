import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Leaf, CreditCard, Zap, ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { ThemeToggle } from './ui/theme-toggle';
import { useAuthStore } from '../store/authStore';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';

const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: Leaf },
    { to: '/expenses', label: 'Expenses', icon: CreditCard },
    { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);

    const handleConfirmLock = () => {
        setIsLockModalOpen(false);
        logout();
    };

    return (
        <>
            <motion.aside
                initial={false}
                animate={{ 
                    width: isCollapsed ? 88 : 260,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    height: '100vh',
                    backgroundColor: 'var(--color-surface)',
                    backdropFilter: 'blur(12px)',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '2rem 0',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 20
                }}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-1rem',
                        top: '2.5rem',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '1rem',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-premium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        color: 'var(--color-text-secondary)',
                        transition: 'all 200ms ease'
                    }}
                >
                    {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
                </button>

                {/* Branding Section */}
                <div style={{ 
                    marginBottom: '3.5rem', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    padding: isCollapsed ? '0' : '0 1.5rem'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '12px',
                        width: '100%'
                    }}>
                        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: isCollapsed ? '100%' : 'auto' }}>
                            <Zap size={32} strokeWidth={2.5} className="text-primary fill-primary/20" />
                        </div>
                        {!isCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}
                            >
                                HabitOS
                            </motion.span>
                        )}
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 1rem' }}>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            title={isCollapsed ? link.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center rounded-2xl transition-all duration-300 group ${
                                    isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-4 py-3.5 gap-4 w-full'
                                } ${
                                    isActive
                                        ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`
                            }
                        >
                            <link.icon size={22} strokeWidth={2.5} />
                            {!isCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-bold text-[0.95rem]"
                                >
                                    {link.label}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Section */}
                <div style={{ 
                    marginTop: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem',
                    alignItems: 'center',
                    padding: '0 1rem'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isCollapsed ? 'column' : 'row',
                        gap: '12px', 
                        alignItems: isCollapsed ? 'center' : 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        width: '100%'
                    }}>
                        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', width: isCollapsed ? '100%' : 'auto' }}>
                            <ThemeToggle />
                        </div>
                        
                        <button
                            onClick={() => setIsLockModalOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'center',
                                gap: '12px',
                                width: isCollapsed ? '48px' : 'auto',
                                height: isCollapsed ? '48px' : 'auto',
                                padding: isCollapsed ? '0' : '0.75rem 1rem',
                                borderRadius: '16px',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                flexShrink: 0
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#ef4444';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                            }}
                        >
                            <LogOut size={20} strokeWidth={2.5} />
                            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Lock App</span>}
                        </button>
                    </div>
                    
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ 
                                width: '100%',
                                padding: '1rem', 
                                borderRadius: '16px', 
                                backgroundColor: 'oklch(var(--color-primary-oklch) / 0.05)', 
                                border: '1px solid oklch(var(--color-primary-oklch) / 0.1)',
                                fontSize: '0.7rem', 
                                color: 'var(--color-text-muted)'
                            }}
                        >
                            <div style={{ opacity: 0.6, fontWeight: 600 }}>PRIVATE LOCAL STORAGE</div>
                            <div style={{ fontWeight: 800, marginTop: '2px', color: 'var(--color-text-secondary)' }}>HabitOS PRO v1.0.4</div>
                        </motion.div>
                    )}
                </div>
            </motion.aside>

            {/* Lock Confirmation Modal */}
            <Modal 
                isOpen={isLockModalOpen} 
                onClose={() => setIsLockModalOpen(false)}
                title="Lock Session?"
            >
                <div className="flex flex-col gap-6">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Are you sure you want to lock the app? You will need your PIN to unlock it again.
                    </p>
                    <div className="flex gap-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 rounded-2xl h-12 font-bold"
                            onClick={() => setIsLockModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-red-500/20"
                            onClick={handleConfirmLock}
                        >
                            Lock Now
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
