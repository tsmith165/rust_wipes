'use client';

import CopyToClipboardButton from '@/app/recent/CopyToClipboardButton';
import Link from 'next/link';

interface CardContentProps {
    serverId: string;
    playerCount: number;
    maxPlayers: number;
    rustBuild: string;
    lastRestart: Date | null;
    lastWipe: Date | null;
    bmId: string;
}

function formatTimeDifference(date: Date | null): string {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

const SERVER_IP = '104.128.48.138';

export function CardContent({ serverId, playerCount, maxPlayers, rustBuild, lastRestart, lastWipe, bmId }: CardContentProps) {
    return (
        <div className="flex flex-col gap-2">
            <CardRow
                label="Server IP"
                value={`${SERVER_IP}:${serverId}`}
                extraContent={
                    <CopyToClipboardButton
                        textToCopy={`${SERVER_IP}:${serverId}`}
                        defaultColor="text-stone-300"
                        hoverColor="hover:text-green-200"
                        successColor="text-emerald-500"
                        hoverSuccessColor="hover:text-emerald-600"
                    />
                }
            />
            <CardRow label="Players" value={`${playerCount} / ${maxPlayers}`} />
            <CardRow label="Rust Version" value={rustBuild} />
            <CardRow label="Last Restart" value={`${formatTimeDifference(lastRestart)} ago`} />
            <CardRow label="Last Wipe" value={`${formatTimeDifference(lastWipe)} ago`} />
            <CardRow label="Battlemetrics" value={bmId} isLink={`https://www.battlemetrics.com/servers/rust/${bmId}`} />
        </div>
    );
}

interface CardRowProps {
    label: string;
    value: string | number;
    extraContent?: React.ReactNode;
    isLink?: string;
}

function CardRow({ label, value, extraContent, isLink }: CardRowProps) {
    const content = (
        <div className="flex items-center justify-between rounded px-2 py-1 transition-colors hover:bg-stone-800">
            <span className="text-sm text-stone-400">{label}:</span>
            <div className="flex items-center gap-2">
                {extraContent}
                <span className="text-sm text-stone-300">{value}</span>
            </div>
        </div>
    );

    if (isLink) {
        return (
            <Link href={isLink} target="_blank" className="hover:opacity-80">
                {content}
            </Link>
        );
    }

    return content;
}
