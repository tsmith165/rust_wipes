'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { TbProgress } from 'react-icons/tb';
import { runStripePurchase, verifySteamId } from '../actions';
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
    const [steamId, setSteamId] = useState('');
    const [steamProfile, setSteamProfile] = useState<{ name: string; avatarUrl: string } | null>(null);

    const handleStripePurchaseClick = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setSubmitted(false);
        setErrorFound(false);

        const formData = new FormData(event.currentTarget);
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

    const handleSteamIdChange = async (value: string) => {
        setSteamId(value);
        if (value.length > 0) {
            const profile = await verifySteamId(value);
            setSteamProfile(profile);
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
                        idName="steam_id"
                        name="Steam ID"
                        placeholder="Enter your Steam ID..."
                        value={steamId}
                        onChange={(e) => handleSteamIdChange(e.target.value)}
                    />
                    {steamProfile && (
                        <div className="flex items-center space-x-2">
                            <img src={steamProfile.avatarUrl} alt="Steam Avatar" className="h-8 w-8 rounded-full" />
                            <span>{steamProfile.name}</span>
                        </div>
                    )}
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
