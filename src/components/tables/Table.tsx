import React from 'react';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export function Table({ children, className = '' }: TableProps) {
    return (
        <div className={`overflow-x-auto rounded-lg bg-stone-800 ${className}`}>
            <table className="w-full">{children}</table>
        </div>
    );
}
