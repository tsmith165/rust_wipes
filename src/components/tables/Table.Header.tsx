import React from 'react';

interface TableHeaderProps {
    columns: {
        key: string;
        label: string;
        width?: string;
    }[];
}

export function TableHeader({ columns }: TableHeaderProps) {
    return (
        <thead>
            <tr className="border-b border-stone-600 text-primary_light">
                {columns.map((column) => (
                    <th key={column.key} className={`${column.width ?? 'w-auto'} p-3 text-left`}>
                        {column.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
}
