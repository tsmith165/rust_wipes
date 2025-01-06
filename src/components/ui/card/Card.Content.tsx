'use client';

import CopyToClipboardButton from '@/app/recent/CopyToClipboardButton';
import Link from 'next/link';
import { StatusControls } from '@/app/admin/status/Status.Controls';
import { NextWipeInfo } from '@/db/schema';

interface CardContentProps {
    server: NextWipeInfo;
    playerCount: number;
    maxPlayers: number;
    rustBuild: string;
    onRestart?: () => void;
    onRegularWipe?: () => void;
    onBpWipe?: () => void;
    onCheckPlugins?: () => void;
    isRestartLoading?: boolean;
    isRegularWipeLoading?: boolean;
    isBpWipeLoading?: boolean;
    isCheckPluginsLoading?: boolean;
}

function formatTimeDifference(dateStr: string | Date | null): string {
    if (!dateStr) return 'Never';

    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (!(date instanceof Date) || isNaN(date.getTime())) return 'Invalid date';

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

export function CardContent({
    server,
    playerCount,
    maxPlayers,
    rustBuild,
    onRestart,
    onRegularWipe,
    onBpWipe,
    onCheckPlugins,
    isRestartLoading,
    isRegularWipeLoading,
    isBpWipeLoading,
    isCheckPluginsLoading,
}: CardContentProps) {
    return (
        <div className="flex flex-col gap-2">
            <CardRow
                label="Server IP"
                value={`${SERVER_IP}:${server.server_id}`}
                extraContent={
                    <CopyToClipboardButton
                        textToCopy={`${SERVER_IP}:${server.server_id}`}
                        defaultColor="text-stone-300"
                        hoverColor="hover:text-green-200"
                        successColor="text-emerald-500"
                        hoverSuccessColor="hover:text-emerald-600"
                    />
                }
            />
            <CardRow label="Players" value={`${playerCount} / ${maxPlayers}`} />
            <CardRow label="Rust Version" value={rustBuild} />
            <CardRow label="Last Restart" value={`${formatTimeDifference(server.last_restart)} ago`} />
            <CardRow label="Last Wipe" value={`${formatTimeDifference(server.last_wipe)} ago`} />

            <StatusControls
                server={server}
                onRestart={onRestart}
                onRegularWipe={onRegularWipe}
                onBpWipe={onBpWipe}
                onCheckPlugins={onCheckPlugins}
                isRestartLoading={isRestartLoading}
                isRegularWipeLoading={isRegularWipeLoading}
                isBpWipeLoading={isBpWipeLoading}
                isCheckPluginsLoading={isCheckPluginsLoading}
            />
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
