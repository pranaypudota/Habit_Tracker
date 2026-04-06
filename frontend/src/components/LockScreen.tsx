import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, AlertCircle, RefreshCcw, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export const LockScreen: React.FC = () => {
    const { isConfigured, unlock, checkStatus, lockedUntil } = useAuthStore();
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState<'login' | 'setup' | 'recovery' | 'show-key'>('login');
    const [error, setError] = useState<string | null>(null);
    const [recoveryKey, setRecoveryKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recoveryInput, setRecoveryInput] = useState('');
    const [newPinInput, setNewPinInput] = useState('');

    useEffect(() => {
        // Only trigger automatic mode changes if we aren't in a special state
        // like viewing the recovery key or performing an emergency reset.
        if (mode === 'show-key' || mode === 'recovery') return;

        if (!isConfigured) {
            setMode('setup');
        } else {
            setMode('login');
        }
    }, [isConfigured, mode]);

    const handlePinPress = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError(null);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        setIsLoading(true);
        try {
            if (mode === 'setup') {
                const res = await api.auth.setup(pin);
                setRecoveryKey(res.recovery_key);
                setMode('show-key');
                await checkStatus();
            } else if (mode === 'login') {
                const res = await api.auth.login(pin);
                unlock(res.access_token);
            }
        } catch (err: any) {
            if (window.navigator?.vibrate) window.navigator.vibrate(100);
            setError(err.response?.data?.detail || 'Authentication failed');
            setPin('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoverySubmit = async () => {
        if (recoveryInput.length < 10) {
            setError('Please enter a valid recovery key');
            return;
        }
        if (newPinInput.length < 4 || newPinInput.length > 6) {
            setError('New PIN must be 4-6 digits');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.auth.recover(recoveryInput, newPinInput);
            unlock(res.access_token);
        } catch (err: any) {
            if (window.navigator?.vibrate) window.navigator.vibrate(100);
            setError(err.response?.data?.detail || 'Recovery failed');
        } finally {
            setIsLoading(false);
        }
    };

    const shakeAnimation = {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/90 backdrop-blur-xl transition-all duration-500">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-sm p-8 glass border border-[var(--color-border)] rounded-3xl shadow-2xl flex flex-col items-center gap-8"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-[var(--color-accent-green)]/20 rounded-2xl text-[var(--color-accent-green)]">
                        {mode === 'setup' ? <ShieldCheck size={32} /> : mode === 'recovery' ? <RefreshCcw size={32} /> : <Lock size={32} />}
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                        {mode === 'setup' ? 'Set Your Security PIN' : mode === 'recovery' ? 'Emergency PIN Recovery' : 'Welcome Back'}
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-sm text-center">
                        {mode === 'setup' ? 'Protect your local data with a 4-6 digit code.' : mode === 'recovery' ? 'Enter recovery key to reset your access.' : 'Please enter your PIN to continue.'}
                    </p>
                </div>

                {mode === 'show-key' ? (
                   <div className="w-full flex flex-col gap-6 items-center">
                        <div className="w-full p-6 bg-[var(--color-accent-amber)]/10 border border-[var(--color-accent-amber)]/20 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-[var(--color-accent-amber)] font-semibold mb-1">
                                <AlertCircle size={18} />
                                <span>Save This Key!</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                                This is your ONLY way to access your data if you forget your PIN. Store it offline or in a safe place.
                            </p>
                            <div className="text-xl font-mono text-[var(--color-text-primary)] text-center tracking-widest bg-[var(--color-bg)]/40 py-3 rounded-xl border border-[var(--color-border)] select-all">
                                {recoveryKey}
                            </div>
                        </div>
                        <button 
                            onClick={() => unlock('')} // Close for now, logic handles it
                            className="w-full py-4 bg-[var(--color-accent-green)] hover:brightness-110 text-[var(--color-bg)] font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                            I Have Saved My Recovery Key
                        </button>
                   </div>
                ) : (
                    <>
                        {lockedUntil && (
                            <div className="text-[var(--color-accent-amber)] text-xs text-center border border-[var(--color-accent-amber)]/20 bg-[var(--color-accent-amber)]/5 px-4 py-2 rounded-xl">
                                Brute force protection active. Try again after {new Date(lockedUntil).toLocaleTimeString()}.
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {mode === 'recovery' ? (
                                <motion.div 
                                    key="recovery"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full flex flex-col gap-4"
                                >
                                     <input 
                                        type="text" 
                                        placeholder="KFXN-8R2M-PQTV-4WHL"
                                        value={recoveryInput}
                                        onChange={(e) => setRecoveryInput(e.target.value.toUpperCase())}
                                        className="w-full p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-green)]/50 transition-all font-mono"
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Enter New PIN (4-6 digits)"
                                        maxLength={6}
                                        value={newPinInput}
                                        onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        className="w-full p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-green)]/50 transition-all"
                                    />
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setMode('login')}
                                            className="flex-1 py-4 bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleRecoverySubmit}
                                            className="flex-1 py-4 bg-[var(--color-accent-green)] hover:filter hover:brightness-110 text-[var(--color-bg)] font-bold rounded-xl transition-all shadow-lg active:scale-95"
                                        >
                                            Reset Access
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="keypad"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="w-full flex flex-col gap-8"
                                >
                                    <div className="flex flex-col items-center gap-8">
                                        <motion.div 
                                            animate={error ? shakeAnimation : {}}
                                            className="flex gap-4"
                                        >
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <div 
                                                        key={i}
                                                        className={`w-4 h-4 rounded-full border border-[var(--color-border)] transition-all duration-300 ${pin.length > i ? 'bg-[var(--color-accent-green)] border-none shadow-[0_0_12px_rgba(74,222,128,0.5)]' : 'bg-[var(--color-surface)]'}`}
                                                />
                                            ))}
                                        </motion.div>

                                        <div className="grid grid-cols-3 gap-4 w-full">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => handlePinPress(num.toString())}
                                                    className="p-6 text-2xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-2xl border border-[var(--color-border)] transition-all active:scale-90"
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <button 
                                                onClick={() => {
                                                    setMode('recovery');
                                                    setError(null);
                                                }} 
                                                className="p-6 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center justify-center underline decoration-[var(--color-text-muted)]/30 text-center"
                                            >
                                                Forgot PIN?
                                            </button>
                                             <button
                                                onClick={() => handlePinPress('0')}
                                                className="p-6 text-2xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-2xl border border-[var(--color-border)] transition-all active:scale-90"
                                            >
                                                0
                                            </button>
                                            <button 
                                                onClick={handleDelete}
                                                className="p-6 text-xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] rounded-2xl border border-[var(--color-border)] transition-all active:scale-90 flex items-center justify-center text-[var(--color-text-secondary)]"
                                            >
                                            <RefreshCcw size={20} />
                                            </button>
                                        </div>

                                        <button 
                                            disabled={pin.length < 4 || isLoading || !!lockedUntil}
                                            onClick={handleSubmit}
                                            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 ${pin.length >= 4 && !lockedUntil ? 'bg-[var(--color-accent-green)] text-[var(--color-bg)] shadow-lg shadow-[var(--color-accent-green)]/20 hover:brightness-110' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed'}`}
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {mode === 'setup' ? 'Configure Security' : 'Unlock App'}
                                                    <ArrowRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </motion.div>
            <div className="fixed bottom-8 text-[10px] text-[var(--color-text-muted)] font-mono tracking-widest uppercase">
                Habit Tracker Secure Node • ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </div>
        </div>
    );
};
