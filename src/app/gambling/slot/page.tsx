import { Suspense } from 'react';
import SlotContainer from './Slot.Container';
import PageLayout from '@/components/layout/PageLayout';
import type { Metadata } from 'next';
import { getRandomSymbol } from './Slot.Utils';

// Constants for initial grid
const VISIBLE_ITEMS = 5;
const REELS = 5;

// Generate initial symbols on the server
function generateInitialSymbols() {
    return Array(REELS)
        .fill(0)
        .map(() =>
            Array(VISIBLE_ITEMS)
                .fill(0)
                .map(() => getRandomSymbol()),
        );
}

export const metadata: Metadata = {
    title: 'Rust Wipes - Slot Machine',
    description:
        'Rust Wipes helps gamers find servers based on their wipe schedules. Discover recent wipes, upcoming wipes, and scrapper statistics.',
    keywords:
        'rust, rustwipes, rust wipes, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Slot Machine',
        description: 'Slot Machine for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Rust Wipes',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default function SlotMachinePage() {
    // Generate initial symbols on the server
    const initialSymbols = generateInitialSymbols();

    return (
        <PageLayout page="/gambling/slot-machine">
            <Suspense fallback={<div className="h-[100dvh] w-full animate-pulse bg-gray-800" />}>
                <SlotContainer initialSymbols={initialSymbols} />
            </Suspense>
        </PageLayout>
    );
}
