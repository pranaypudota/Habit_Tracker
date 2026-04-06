import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface AuthState {
  token: string | null;
  isLocked: boolean;
  isConfigured: boolean;
  lockedUntil: string | null;
  
  // Actions
  setToken: (token: string | null) => void;
  checkStatus: () => Promise<void>;
  logout: () => void;
  unlock: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isLocked: true,
      isConfigured: false,
      lockedUntil: null,

      setToken: (token) => set({ token }),
      
      checkStatus: async () => {
        try {
          const status = await api.auth.status();
          set({ 
            isConfigured: status.is_configured, 
            isLocked: status.is_locked || !!status.is_configured, // Re-lock on every reload if configured
            lockedUntil: status.locked_until 
          });
        } catch (error) {
          console.error('Failed to fetch auth status', error);
        }
      },

      unlock: (token) => set({ token, isLocked: false }),

      logout: () => {
        set({ token: null, isLocked: true });
        localStorage.removeItem('auth-storage'); // Force immediate clear
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);
