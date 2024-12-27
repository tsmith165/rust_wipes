import React from 'react';

interface TableRowProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export function TableRow({ children, onClick }: TableRowProps) {
    return (
        <tr
            className="border-b border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-primary_light"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {children}
        </tr>
    );
}
