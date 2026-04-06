import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export function useIdleLock() {
    const { isLocked, isConfigured, logout } = useAuthStore();
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isConfigured || isLocked) return;

        const resetTimer = () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = window.setTimeout(() => {
                console.log('App idle for 10 minutes. Locking...');
                logout();
            }, IDLE_TIMEOUT);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const handleActivity = () => resetTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
        resetTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, [isLocked, isConfigured, logout]);
}
