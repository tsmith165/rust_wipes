'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Map symbols to image paths
const ITEM_ICON_PATHS: Record<string, string> = {
    scrap: '/rust_icons/scrap_icon.png',
    metal_fragments: '/rust_icons/metal_fragments_icon.png',
    high_quality_metal: '/rust_icons/hqm_icon.png',
    thompson: '/rust_icons/thompson_icon.png',
    m39_rifle: '/rust_icons/m39_icon.png',
    ak47: '/rust_icons/ak47_icon.png',
    bonus: '/rust_icons/bonus_symbol.png',
};

interface Winner {
    playerName: string;
    steamId: string;
    payout: Array<{ quantity: number; full_name: string }>;
    timestamp: string;
    profilePicture?: string;
    bonusType?: 'normal' | 'sticky';
    bonusAmount?: number;
}

interface RecentWinnersProps {
    winners: Winner[];
    onRefresh?: () => void;
    isLoading?: boolean;
    error?: string;
    className?: string;
}

interface WinnerCardProps {
    winner: Winner;
    className?: string;
    animate?: boolean;
    onProfileClick?: () => void;
}

interface WinnerProfileProps {
    steamId: string;
    playerName: string;
    profilePicture?: string;
    className?: string;
    onClick?: () => void;
}

const getItemKey = (fullName: string): string => {
    const nameMap: Record<string, string> = {
        'AK-47': 'ak47',
        M39: 'm39_rifle',
        Thompson: 'thompson',
        Scrap: 'scrap',
        'Metal Fragments': 'metal_fragments',
        'High Quality Metal': 'high_quality_metal',
        Bonus: 'bonus',
        '2x Multiplier': '2x_multiplier',
        '3x Multiplier': '3x_multiplier',
        '5x Multiplier': '5x_multiplier',
    };
    return nameMap[fullName] || fullName.toLowerCase().replace(/[-\s]/g, '_');
};

const WinnerProfile: React.FC<WinnerProfileProps> = ({ steamId, playerName, profilePicture, className, onClick }) => {
    return (
        <motion.div
            className={cn('flex items-center gap-2', className)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            onClick={onClick}
        >
            <Image
                src={profilePicture || '/steam_icon_small.png'}
                alt={`${playerName}'s profile`}
                width={32}
                height={32}
                className="rounded-full"
                onError={(e) => {
                    e.currentTarget.src = '/steam_icon_small.png';
                }}
            />
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{playerName}</span>
                <span className="text-xs text-gray-400">Steam ID: {steamId}</span>
            </div>
        </motion.div>
    );
};

const WinnerCard: React.FC<WinnerCardProps> = ({ winner, className, animate = true, onProfileClick }) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0, y: -20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className={cn('rounded-lg bg-stone-800 p-4 shadow-lg', className)}
        >
            <div className="flex items-start justify-between">
                <WinnerProfile
                    steamId={winner.steamId}
                    playerName={winner.playerName}
                    profilePicture={winner.profilePicture}
                    className="cursor-pointer"
                    onClick={onProfileClick}
                />
                <span className="text-xs text-gray-400">{new Date(winner.timestamp).toLocaleString()}</span>
            </div>
            <motion.div className="mt-2 space-y-2">
                {winner.payout.map((item, index) => (
                    <motion.div
                        key={`${item.full_name}-${index}`}
                        initial={animate ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <Image
                            src={ITEM_ICON_PATHS[getItemKey(item.full_name)] || '/rust_icons/scrap_icon.png'}
                            alt={item.full_name}
                            width={24}
                            height={24}
                            className="rounded-sm"
                        />
                        <span className="text-sm text-white">
                            {item.quantity}x {item.full_name}
                        </span>
                    </motion.div>
                ))}
                {winner.bonusAmount !== undefined && winner.bonusAmount > 0 && !winner.bonusType && (
                    <motion.div initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Image src={ITEM_ICON_PATHS.bonus} alt="Bonus" width={24} height={24} className="rounded-sm" />
                        <span className="text-sm text-yellow-400">{winner.bonusAmount}x Bonus Symbols - Selecting Bonus Type...</span>
                    </motion.div>
                )}
                {winner.bonusAmount !== undefined && winner.bonusAmount > 0 && winner.bonusType && (
                    <motion.div initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Image src={ITEM_ICON_PATHS.bonus} alt="Bonus" width={24} height={24} className="rounded-sm" />
                        <span className="text-sm text-white">
                            {winner.bonusAmount}x {winner.bonusType === 'sticky' ? 'Sticky' : 'Normal'} Bonus Spins
                        </span>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

/**
 * Recent winners component for slot machines.
 * Displays recent winning spins with animations and Steam profile integration.
 */
export function SlotRecentWinners({ winners, onRefresh, isLoading, error, className }: RecentWinnersProps) {
    // Use React's useRef to keep track of the previous winners for diffing
    const prevWinnersRef = React.useRef<Winner[]>([]);
    const [displayedWinners, setDisplayedWinners] = React.useState<Winner[]>([]);

    // Update winners list with diffing
    React.useEffect(() => {
        if (winners.length === 0) {
            setDisplayedWinners([]);
            prevWinnersRef.current = [];
            return;
        }

        // Function to check if a winner is new
        const isNewWinner = (winner: Winner) => {
            return !prevWinnersRef.current.some(
                (prevWinner) => prevWinner.steamId === winner.steamId && prevWinner.timestamp === winner.timestamp,
            );
        };

        // Get only the new winners
        const newWinners = winners.filter(isNewWinner);

        // Update the displayed winners list with new winners
        setDisplayedWinners((prev) => {
            // Remove any winners that are no longer in the winners list
            const currentWinners = prev.filter((displayedWinner) =>
                winners.some((winner) => winner.steamId === displayedWinner.steamId && winner.timestamp === displayedWinner.timestamp),
            );

            // Add new winners at the beginning
            return [...newWinners, ...currentWinners];
        });

        // Update the previous winners reference
        prevWinnersRef.current = winners;
    }, [winners]);

    return (
        <div className={cn('flex h-full flex-col space-y-4', className)}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Recent Winners</h2>
                {onRefresh && (
                    <motion.button
                        onClick={() => !isLoading && onRefresh()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            'rounded-full p-2 text-white transition-colors hover:bg-stone-700',
                            isLoading && 'cursor-wait opacity-50',
                        )}
                        disabled={isLoading}
                    >
                        <svg className={cn('h-5 w-5', isLoading && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </motion.button>
                )}
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-500 bg-opacity-10 p-3 text-sm text-red-500"
                >
                    {error}
                </motion.div>
            )}

            <div className="flex-1 space-y-4 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {isLoading && displayedWinners.length === 0 ? (
                        // Loading placeholders
                        Array.from({ length: 3 }).map((_, index) => (
                            <motion.div
                                key={`placeholder-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="animate-pulse rounded-lg bg-stone-800 p-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="h-8 w-8 rounded-full bg-stone-600" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/4 rounded bg-stone-600" />
                                        <div className="h-3 w-1/3 rounded bg-stone-600" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : displayedWinners.length > 0 ? (
                        displayedWinners.map((winner, index) => (
                            <WinnerCard
                                key={`${winner.steamId}-${winner.timestamp}`}
                                winner={winner}
                                animate={index === 0}
                                onProfileClick={() => window.open(`https://steamcommunity.com/profiles/${winner.steamId}`, '_blank')}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-full items-center justify-center text-gray-400"
                        >
                            No recent winners
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
