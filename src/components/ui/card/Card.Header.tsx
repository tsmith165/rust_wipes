'use client';

import { SERVER_ICONS, STATUS_COLORS } from '@/app/admin/status/Status.Constants';

interface CardHeaderProps {
    status: 'online' | 'offline' | 'restarting';
    serverName: string;
}

export function CardHeader({ status, serverName }: CardHeaderProps) {
    const StatusIcon = SERVER_ICONS[status];

    return (
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-stone-300">{serverName}</h2>
            <div className={`flex items-center gap-2 ${STATUS_COLORS[status]}`}>
                <StatusIcon size={24} />
                <span className="capitalize">{status}</span>
            </div>
        </div>
    );
}
