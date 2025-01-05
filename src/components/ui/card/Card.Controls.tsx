import { ReactNode } from 'react';

interface CardControlsProps {
    children: ReactNode;
    className?: string;
}

export function CardControls({ children, className = '' }: CardControlsProps) {
    return <div className={`mt-4 flex justify-start space-x-2 ${className}`}>{children}</div>;
}
