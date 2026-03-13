'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[NEURAL GRID ERROR]:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: 'rgba(244, 63, 94, 0.05)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    marginTop: '2rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠⚡</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--brand-alert)' }}>Neural Army Interrupted</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        One of the 41 agents encountered a synchronization lag. The Command Center is automatically rebooting this sector.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            background: 'var(--brand-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Re-Sync Neural Grid
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
