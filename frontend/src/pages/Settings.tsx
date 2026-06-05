import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, AlertCircle, Download, Database } from 'lucide-react';
import { api } from '../lib/api';

export const Settings: React.FC = () => {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await api.export.all();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HabitOS_Export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export failed', err);
            alert('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportCSV = async (type: 'habits' | 'expenses') => {
        try {
            const url = `http://localhost:8000/api/v1/export/csv/${type}`;
            const token = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token;
            
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error('Download failed');
            
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error('CSV Export failed', err);
            alert('Failed to export CSV');
        }
    };
    const handleUpdatePin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPin !== confirmPin) {
            setError('New PINs do not match');
            return;
        }

        if (newPin.length < 4 || newPin.length > 6) {
            setError('PIN must be 4-6 digits');
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.changePin(currentPin, newPin);
            setSuccess(true);
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
        } catch (err: unknown) {
            setError(String((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update PIN'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>Settings</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Manage your application preferences and security.</p>
            </header>

            <main style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
                gap: '2rem',
                alignItems: 'stretch',
                width: '100%'
            }}>
                <section style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '24px', 
                    border: '1px solid var(--color-border)',
                    padding: '2rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(12px)',
                    height: '100%'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '14px', 
                        backgroundColor: 'oklch(var(--color-accent-green) / 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'oklch(var(--color-accent-green))'
                    }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Security</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Protect your local data with a privacy PIN.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Current PIN Row */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Current PIN</label>
                            <input
                                type="password"
                                value={currentPin}
                                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="••••"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'oklch(1 0 0 / 0.02)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '1rem',
                                    letterSpacing: '0.2em',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                    minWidth: 0
                                }}
                                required
                            />
                        </div>
                        
                        {/* New PINs Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>New PIN</label>
                                <input
                                    type="password"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="••••"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: 'oklch(1 0 0 / 0.02)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '1rem',
                                        letterSpacing: '0.2em',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        minWidth: 0
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Confirm PIN</label>
                                <input
                                    type="password"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="••••"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: 'oklch(1 0 0 / 0.02)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '1rem',
                                        letterSpacing: '0.2em',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease',
                                        minWidth: 0
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            backgroundColor: 'oklch(0.6 0.2 25 / 0.1)', 
                            color: 'oklch(0.6 0.2 25)',
                            fontSize: '0.9rem'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            backgroundColor: 'oklch(0.7 0.15 150 / 0.1)', 
                            color: 'oklch(0.7 0.15 150)',
                            fontSize: '0.9rem'
                        }}>
                            <CheckCircle2 size={18} />
                            PIN successfully updated!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            alignSelf: 'flex-start',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            backgroundColor: 'var(--color-accent-green)',
                            color: '#000',
                            fontWeight: 700,
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        {isLoading ? 'Updating...' : 'Update PIN'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>
                </section>

                <section style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '24px', 
                    border: '1px solid var(--color-border)',
                    padding: '2rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(12px)',
                    height: '100%'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '14px', 
                        backgroundColor: 'oklch(var(--color-accent-green) / 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'oklch(var(--color-accent-green))'
                    }}>
                        <Database size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Data Management</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Export or backup your personal tracker data.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        Download your habits, entries, and expenses in a portable JSON format. 
                        This file can be used for manual backups or migrating to another device.
                    </p>
                    
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        style={{
                            alignSelf: 'flex-start',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            backgroundColor: 'oklch(1 0 0 / 0.05)',
                            color: 'var(--color-text-primary)',
                            fontWeight: 600,
                            border: '1px solid var(--color-border)',
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s ease',
                            opacity: isExporting ? 0.7 : 1
                        }}
                        onMouseOver={(e) => !isExporting && (e.currentTarget.style.backgroundColor = 'oklch(1 0 0 / 0.1)')}
                        onMouseOut={(e) => !isExporting && (e.currentTarget.style.backgroundColor = 'oklch(1 0 0 / 0.05)')}
                    >
                        {isExporting ? 'Preparing...' : 'Export All Data (JSON)'}
                        <Download size={18} />
                    </button>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => handleExportCSV('habits')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                backgroundColor: 'transparent',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 500,
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease',
                                fontSize: '0.85rem'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'oklch(1 0 0 / 0.03)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <Download size={14} />
                            Habits CSV
                        </button>
                        <button
                            onClick={() => handleExportCSV('expenses')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '10px',
                                backgroundColor: 'transparent',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 500,
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease',
                                fontSize: '0.85rem'
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'oklch(1 0 0 / 0.03)')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <Download size={14} />
                            Expenses CSV
                        </button>
                    </div>
                </div>
                </section>
            </main>
        </div>
    );
};
