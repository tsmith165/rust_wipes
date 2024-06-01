import React from 'react';

interface LoadingSpinnerProps {
    page?: string;
}

const LoadingSpinner = ({ page }: LoadingSpinnerProps) => {
    return (
        <div className="flex h-full flex-col items-center justify-center">
            <div className="via-primary_dark to-primary_dark flex h-8 w-8 animate-spin items-center justify-center rounded-full bg-gradient-to-r from-primary">
                <div className="bg-primary_dark_dark h-7 w-7 rounded-full opacity-75"></div>
            </div>
            <span className="text-2xl text-primary">{page === '' ? 'Loading...' : `Entering ${page}...`}</span>
        </div>
    );
};

export default LoadingSpinner;
