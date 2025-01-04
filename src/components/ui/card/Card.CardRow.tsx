'use client';

import React from 'react';

interface CardRowGroupProps {
    groupName: string;
    children: React.ReactNode;
}

export function CardRowGroup({ groupName, children }: CardRowGroupProps) {
    return (
        <div className="mb-8">
            <h2 className="mb-4 text-center text-xl font-semibold text-stone-300">{groupName}</h2>
            <div className="flex flex-wrap justify-center gap-4">{children}</div>
        </div>
    );
}
