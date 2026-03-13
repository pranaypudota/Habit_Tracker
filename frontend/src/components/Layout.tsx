import React from 'react';
import { Sidebar } from './Sidebar';

interface Props {
    children: React.ReactNode;
}

export function Layout({ children }: Props) {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}
            >
                {children}
            </main>
        </div>
    );
}
