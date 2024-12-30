'use client';

import React, { useCallback, useEffect, useState } from 'react';

// Zustand Store
import { useSteamUser } from '@/stores/steam_user_store';

// Steam Sign In Modal
import SteamSignInModal from '@/components/SteamSignInModal';

// Base Slot Components
import { SlotControls } from '@/components/slot/base/Slot.Controls';
import { SlotCharacters } from '@/components/slot/base/Slot.Characters';

// Game Slot Components
import { SlotGrid } from '@/components/slot/game/Slot.Grid';
import { SlotWinOverlay } from '@/components/slot/game/Slot.WinOverlay';
import { SlotRecentWinners } from '@/components/slot/game/Slot.RecentWinners';
import { SlotBonusModal } from '@/components/slot/game/Slot.BonusModal';
import { SlotSoundManager } from '@/components/slot/game/Slot.SoundManager';
import { SlotAnimationSync } from '@/components/slot/game/Slot.AnimationSync';

// Default Slot Actions
import { getRecentWinners, spin, selectBonusType } from './Default.Actions';
import type { SpinResult } from './Default.Actions';

interface Winner {
    playerName: string;
    steamId: string;
    payout: Array<{ quantity: number; full_name: string }>;
    timestamp: string;
    profilePicture?: string;
    bonusType?: 'normal' | 'sticky';
    bonusAmount?: number;
}

export function DefaultSlotContainer() {
    const { isVerified, profile, credits, freeSpins, error, verifyUser } = useSteamUser();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [winnersError, setWinnersError] = useState<string>();
    const [spinning, setSpinning] = useState(false);
    const [autoSpinning, setAutoSpinning] = useState(false);
    const [result, setResult] = useState<SpinResult | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [shouldRefetchWinners, setShouldRefetchWinners] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [steamInput, setSteamInput] = useState('');
    const [authCode, setAuthCode] = useState('');

    const fetchWinners = useCallback(async () => {
        try {
            const response = await getRecentWinners();
            if (response.success && response.data) {
                setWinners(
                    response.data.map((winner) => ({
                        playerName: winner.player_name,
                        steamId: winner.steam_id,
                        payout: winner.payout,
                        timestamp: winner.timestamp,
                        profilePicture: winner.profile_picture_url || undefined,
                        bonusType: winner.bonus_type as 'normal' | 'sticky' | undefined,
                        bonusAmount: winner.free_spins_won > 0 ? winner.free_spins_won : winner.pending_bonus_amount,
                    })),
                );
                setWinnersError(undefined);
            } else {
                setWinnersError(response.error || 'Failed to fetch winners');
            }
        } catch (error) {
            console.error('Error fetching winners:', error);
            setWinnersError('An error occurred while fetching winners');
        }
    }, []);

    useEffect(() => {
        if (isVerified) {
            fetchWinners();
        }
    }, [isVerified, fetchWinners]);

    const handleSpin = useCallback(async () => {
        if (!profile?.steamId) return;
        setSpinning(true);
        try {
            const response = await spin(profile.steamId, profile.code);
            if (response.success && response.data) {
                setResult(response.data);
                if (response.data.payout.length > 0 || response.data.bonusSpinsAwarded > 0) {
                    setShowConfetti(true);
                    setShouldRefetchWinners(true);
                }
                if (response.data.needsBonusTypeSelection) {
                    setShowBonusModal(true);
                }
            } else {
                console.error('Spin failed:', response.error);
            }
        } catch (error) {
            console.error('Error during spin:', error);
        } finally {
            setSpinning(false);
        }
    }, [profile]);

    const handleBonusTypeSelect = useCallback(
        async (type: 'normal' | 'sticky') => {
            if (!profile?.steamId) return;
            try {
                const response = await selectBonusType(profile.steamId, profile.code, type);
                if (response.success) {
                    setShowBonusModal(false);
                    setShouldRefetchWinners(true);
                } else {
                    console.error('Failed to select bonus type:', response.error);
                }
            } catch (error) {
                console.error('Error selecting bonus type:', error);
            }
        },
        [profile],
    );

    const handleConfettiComplete = useCallback(() => {
        setShowConfetti(false);
    }, []);

    const handleWinnersRefetchComplete = useCallback(() => {
        setShouldRefetchWinners(false);
    }, []);

    if (!isVerified) {
        return (
            <SteamSignInModal
                steamInput={steamInput}
                setSteamInput={setSteamInput}
                code={authCode}
                setCode={setAuthCode}
                onVerify={verifyUser}
                error={error}
            />
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-900 p-4">
            <div className="flex w-full max-w-7xl flex-col items-center gap-8">
                <div className="flex w-full flex-col items-center gap-4">
                    <SlotCharacters spinning={spinning} result={result} />
                    <SlotGrid
                        grid={result?.finalVisibleGrid || []}
                        spinAmounts={result?.spinAmounts || []}
                        spinKey={0}
                        isSpinning={spinning}
                        winningCells={result?.winningCells || []}
                        bonusCells={result?.bonusCells || []}
                        winningLines={result?.winningLines || []}
                        currentWinningLine={[]}
                        currentWinningLineFlashCount={0}
                    />
                    <SlotControls
                        onSpin={handleSpin}
                        onToggleMute={() => setSoundEnabled(!soundEnabled)}
                        onToggleAutoSpin={() => setAutoSpinning(!autoSpinning)}
                        isMuted={!soundEnabled}
                        isAutoSpinning={autoSpinning}
                        credits={credits}
                        freeSpins={freeSpins || 0}
                        isLoading={spinning}
                        steamProfile={
                            profile
                                ? {
                                      name: profile.name,
                                      avatarUrl: profile.avatarUrl,
                                      steamId: profile.steamId,
                                  }
                                : undefined
                        }
                    />
                </div>
                <div className="w-full">
                    <SlotRecentWinners winners={winners} onRefresh={fetchWinners} isLoading={false} error={winnersError} className="h-96" />
                </div>
            </div>
            <SlotWinOverlay result={result} showConfetti={showConfetti} onConfettiComplete={handleConfettiComplete} />
            <SlotBonusModal onSelect={handleBonusTypeSelect} showConfetti={showConfetti} onConfettiComplete={handleConfettiComplete} />
            <SlotSoundManager
                isMuted={!soundEnabled}
                volume={volume}
                onVolumeChange={setVolume}
                onMuteToggle={() => setSoundEnabled(!soundEnabled)}
            />
            <SlotAnimationSync duration={2} onComplete={() => setSpinning(false)}>
                {null}
            </SlotAnimationSync>
        </div>
    );
}
