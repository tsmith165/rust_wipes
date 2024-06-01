import React from 'react';

interface ServerHeaderProps {
    title: string;
}

export default function ServerHeader({ title }: ServerHeaderProps) {
    return (
        <div className="flex flex-col justify-between rounded-t-lg bg-secondary p-2.5 font-bold hover:bg-secondary_light xl:flex-row">
            <h2 className="w-auto truncate text-2xl font-bold text-primary_light">{title}</h2>
        </div>
    );
}
