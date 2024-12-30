'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
    fallback: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    children: React.ReactNode;
}

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export class SlotErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean; error: Error | null }> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

export function SlotErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex flex-col items-center justify-center rounded-lg bg-red-500 bg-opacity-10 p-6 text-red-500')}
        >
            <h2 className="mb-4 text-lg font-bold">Something went wrong</h2>
            <p className="mb-4 text-sm">{error.message}</p>
            <button onClick={resetErrorBoundary} className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600">
                Try again
            </button>
        </motion.div>
    );
}

export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback: React.ReactNode,
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void,
) {
    return function WithErrorBoundary(props: P) {
        return (
            <SlotErrorBoundary fallback={fallback} onError={onError}>
                <Component {...props} />
            </SlotErrorBoundary>
        );
    };
}
