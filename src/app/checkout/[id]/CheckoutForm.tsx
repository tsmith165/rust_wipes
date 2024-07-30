'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { TbProgress } from 'react-icons/tb';
import { runStripePurchase, verifySteamProfile } from '../actions';
import InputTextbox from '@/components/inputs/InputTextbox';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';
import { KitsWithExtraImages } from '@/db/schema';

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

                <div className="flex flex-col space-y-2">
                    <InputTextbox
                        idName="steam_profile_url"
                        name="Steam Profile URL"
                        placeholder="Enter your Steam Profile URL..."
                        value={steamProfileUrl}
                        onChange={(e) => setSteamProfileUrl(e.target.value)}
                        labelWidth="xl" // Use the extra large width for this label
                    />
                    <button
                        type="button"
                        onClick={handleSteamProfileVerification}
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                        Verify Steam Profile
                    </button>
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
                    <StripeBrandedButton url={'submit'} price={String(current_kit.price || 0)} text="purchase" />
                    <div className="mt-2">
                        <div className="font-sans text-stone-300">{`Kit will be available in-game after purchase.`}</div>
                    </div>
                </div>

                {submit_container}
            </form>
        </div>
    );
};

export default CheckoutForm;
