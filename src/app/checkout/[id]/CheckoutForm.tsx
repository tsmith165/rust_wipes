'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { runStripePurchase, verifySteamProfile } from '../actions';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';
import { KitsWithExtraImages } from '@/db/schema';

import { FaSteam } from 'react-icons/fa';
import { TbProgress } from 'react-icons/tb';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
    current_kit: KitsWithExtraImages;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ current_kit }) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorFound, setErrorFound] = useState(false);
    const [steamProfileUrl, setSteamProfileUrl] = useState('');
    const [steamProfile, setSteamProfile] = useState<{ name: string; avatarUrl: string; steamId: string } | null>(null);
    const [steamError, setSteamError] = useState<string | null>(null);

    const handleStripePurchaseClick = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!steamProfile) {
            setSteamError('Please verify your Steam profile before purchasing.');
            return;
        }
        setLoading(true);
        setSubmitted(false);
        setErrorFound(false);

        const formData = new FormData(event.currentTarget);
        formData.append('steam_id', steamProfile.steamId);
        formData.append('steam_username', steamProfile.name);
        const response = await runStripePurchase(formData);

        if (response && response.success && response.redirectUrl) {
            window.location.href = response.redirectUrl;
        } else {
            console.error('Stripe purchase failed');
            setLoading(false);
            setSubmitted(false);
            setErrorFound(true);
        }
    };

    const handleSteamProfileVerification = async () => {
        setSteamError(null);
        if (steamProfileUrl.length > 0) {
            try {
                const profile = await verifySteamProfile(steamProfileUrl);
                setSteamProfile(profile);
            } catch (error) {
                console.error('Error verifying Steam profile:', error);
                setSteamProfile(null);
                setSteamError('Failed to verify Steam profile. Please check the URL and try again.');
            }
        } else {
            setSteamProfile(null);
        }
    };

    const submit_loader_spinner = <TbProgress className="animate-spin text-primary" />;
    const submit_successful_jsx = <div className="text-green-500">Checkout submit successful.</div>;
    const submit_unsuccessful_jsx = <div className="text-red-500">Checkout submit was not successful.</div>;

    const loader_container = loading
        ? submit_loader_spinner
        : submitted
          ? submit_successful_jsx
          : errorFound
            ? submit_unsuccessful_jsx
            : null;

    const submit_container = loader_container && <div className="mt-4">{loader_container}</div>;

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto">
            <form onSubmit={handleStripePurchaseClick} className="flex flex-col">
                <input type="hidden" name="kit_id" value={current_kit.id} />

                <div className="flex flex-col items-center space-y-2">
                    <div className="flex w-full flex-row items-center">
                        <div className="flex-grow">
                            <input
                                type="text"
                                id="steam_profile_url"
                                name="steam_profile_url"
                                className="h-8 w-full rounded-l-md border-none bg-stone-400 px-2 text-sm font-bold text-stone-950 placeholder-stone-700"
                                placeholder="Enter Steam Profile URL"
                                value={steamProfileUrl}
                                onChange={(e) => setSteamProfileUrl(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSteamProfileVerification}
                            className="flex h-8 items-center justify-center rounded-r-md bg-gradient-to-b from-blue-500 to-blue-600 px-3 text-white hover:from-blue-600 hover:to-blue-900"
                        >
                            <FaSteam className="mr-2 h-4 w-4" />
                            <span className="text-sm font-bold">Verify</span>
                        </button>
                    </div>
                    {steamProfile && (
                        <div className="flex items-center space-x-2">
                            <img src={steamProfile.avatarUrl} alt="Steam Avatar" className="h-8 w-8 rounded-full" />
                            <span>{steamProfile.name}</span>
                            <span className="text-sm text-gray-500">({steamProfile.steamId})</span>
                        </div>
                    )}
                    {steamError && <div className="text-red-500">{steamError}</div>}
                </div>

                <div className="mt-4">
                    <div className={`${steamProfile ? '' : 'pointer-events-none opacity-50'}`}>
                        <StripeBrandedButton url={'submit'} price={String(current_kit.price || 0)} text="purchase" />
                    </div>
                    {!steamProfile && (
                        <div className="mt-2 text-sm text-yellow-500">
                            Before you can purchase, we need to verify your Steam ID in order to grant in-game access to the kit.
                        </div>
                    )}
                    <div className={`mt-2 ${current_kit.type === 'monthly' ? '' : 'hidden'}`}>
                        <div className={`font-sans text-stone-300`}>
                            <span>{`Kit will be available in-game with `}</span>
                            <span className="text-primary_light">{`/kit ${current_kit.name.toLowerCase()}`}</span>
                            <span>{` after purchase.`}</span>
                        </div>
                        <div className={`font-sans text-stone-300`}>
                            {`Kits are locked for 4 hours after wipe, then available every 8 hours.`}
                        </div>
                        <div className={`font-sans text-stone-300`}>
                            <span>{`This rank give access to `}</span>
                            <span className="text-primary_light">{`/kit ${current_kit.name.toLowerCase()}`}</span>
                            <span>{` for 30 days.`}</span>
                        </div>
                    </div>
                    <div className={`mt-2 ${current_kit.type === 'single' ? '' : 'hidden'}`}>
                        <div className={`font-sans text-stone-300`}>
                            <span>{`Use `}</span>
                            <span className="text-primary_light">{`/redeem`}</span>
                            <span>{` on any of our servers after purchase to redeem.`}</span>
                        </div>
                        <div className={`font-sans text-stone-300`}>{`Kits are locked and cannot be redeemed for 4 hours after wipe.`}</div>
                    </div>
                </div>

                {submit_container}
            </form>
        </div>
    );
};

export default CheckoutForm;
