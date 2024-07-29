import { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import KitPage from './KitPage';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Rust Wipes - Kits',
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
        images: '/og-image.png',
    },
};

export default async function Page() {
    const suspense_fallback = (
        <div className="inset-0 flex h-full w-full items-center justify-center">
            <div className="xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px] relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70">
                <Image src="/rust_hazmat_icon.png" alt="Rust Logo" width={186} height={186} />
            </div>
        </div>
    );

    return (
        <PageLayout page="/kits">
            <Suspense fallback={suspense_fallback}>
                <KitPage />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
