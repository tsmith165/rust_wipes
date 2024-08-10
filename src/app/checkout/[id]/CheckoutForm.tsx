'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createStripeSession, verifySteamProfile } from '../actions';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';
import { KitsWithExtraImages } from '@/db/schema';
import { FaSteam } from 'react-icons/fa';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface CheckoutFormProps {
    current_kit: KitsWithExtraImages;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ current_kit }) => {
    const [steamProfileUrl, setSteamProfileUrl] = useState('');
    const [steamProfile, setSteamProfile] = useState<{ name: string; avatarUrl: string; steamId: string } | null>(null);
    const [steamError, setSteamError] = useState<string | null>(null);
    const [email, setEmail] = useState('');

    const handleStripePurchaseClick = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!steamProfile) {
            setSteamError('Please verify your Steam profile before purchasing.');
            return;
        }
        if (!email) {
            setSteamError('Please provide your email before purchasing.');
            return;
        }

        const formData = new FormData(event.currentTarget);
        formData.append('steam_id', steamProfile.steamId);
        formData.append('steam_username', steamProfile.name);
        formData.append('email', email);
        formData.append('is_subscription', (current_kit.type === 'monthly' || current_kit.type === 'priority').toString());

        const response = await createStripeSession(formData);

        if (response.error) {
            setSteamError(response.error);
            return;
        }

        const stripe = await stripePromise;
        if (!stripe) {
            setSteamError('Failed to load Stripe');
            return;
        }

        const result = await stripe.redirectToCheckout({
            sessionId: response.sessionId,
        });

        if (result.error) {
            setSteamError(result.error.message || 'An error occurred. Please try again.');
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

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto">
            <form onSubmit={handleStripePurchaseClick} className="flex flex-col">
                <input type="hidden" name="kit_id" value={current_kit.id} />

                <div className="">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="h-8 w-full rounded-md border-none bg-stone-400 px-2 text-sm font-bold text-stone-950 placeholder-stone-700"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mt-2 flex flex-col items-start space-y-2">
                    <div className="flex w-full flex-row">
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
                            className="flex h-8 items-center justify-center rounded-r-md bg-gradient-to-b from-blue-500 to-blue-600 px-3 text-stone-950 hover:from-blue-600 hover:to-blue-900 hover:text-stone-300"
                        >
                            <FaSteam className="mr-1.5 h-6 w-6" />
                            <span className="text-md font-bold">Verify</span>
                        </button>
                    </div>
                    {steamProfile && (
                        <div className="flex items-start space-x-2">
                            <img src={steamProfile.avatarUrl} alt="Steam Avatar" className="h-8 w-8 rounded-full" />
                            <span className="text-md leading-8 text-gray-300">{steamProfile.name}</span>
                            <span className="text-md leading-8 text-gray-400">({steamProfile.steamId})</span>
                        </div>
                    )}
                    {steamError && <div className="text-red-500">{steamError}</div>}
                </div>

                <div className="">
                    {(!steamProfile || !email) && (
                        <div className="mt-2 text-sm text-yellow-500">
                            Please verify your Steam profile and provide your email before purchasing.
                        </div>
                    )}
                    <div className={`mt-2 ${steamProfile && email ? '' : 'pointer-events-none opacity-50'}`}>
                        <StripeBrandedButton
                            url={'submit'}
                            price={String(current_kit.price || 0)}
                            text={current_kit.type === 'monthly' || current_kit.type === 'priority' ? 'subscribe' : 'purchase'}
                        />
                    </div>
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
                            <span>{`This subscription gives access to `}</span>
                            <span className="text-primary_light">{`/kit ${current_kit.name.toLowerCase()}`}</span>
                            <span>{` for as long as your subscription is active.`}</span>
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
                    <div className={`mt-2 ${current_kit.type === 'priority' ? '' : 'hidden'}`}>
                        <div className={`font-sans text-stone-300`}>
                            <span>{`This subscription gives you priority access to our servers and `}</span>
                            <span className="text-primary_light">{`/kit ${current_kit.name.toLowerCase()}`}</span>
                            <span>{` for as long as your subscription is active.`}</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;
