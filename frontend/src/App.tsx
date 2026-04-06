import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { LockScreen } from './components/LockScreen';
import { useAuthStore } from './store/authStore';
import { useIdleLock } from './lib/hooks/useIdleLock';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Habits = lazy(() => import('./pages/Habits').then(module => ({ default: module.Habits })));
const Expenses = lazy(() => import('./pages/Expenses').then(module => ({ default: module.Expenses })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>
  );
}

export default function App() {
  const { isLocked, checkStatus, logout } = useAuthStore();
  
  useIdleLock();

  useEffect(() => {
    checkStatus();

    // Global interceptor for 401s from api.ts
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [checkStatus, logout]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        {isLocked ? (
          <LockScreen />
        ) : (
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </Layout>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}
