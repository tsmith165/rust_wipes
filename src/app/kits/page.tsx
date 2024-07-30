import type { Metadata } from 'next';
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

import { fetchKits } from '@/app/actions';
import React from 'react';
import KitViewer from './KitViewer';
import PageLayout from '@/components/layout/PageLayout';
import { redirect } from 'next/navigation';

interface PageProps {
    searchParams?: {
        kit?: string;
    };
}

export default async function KitPage({ searchParams }: PageProps) {
    const kitData = await fetchKits();

    if (kitData.length === 0) {
        return <div>No kits available.</div>;
    }

    const selectedKitId = searchParams?.kit ? parseInt(searchParams.kit, 10) : null;

    if (!selectedKitId) {
        // Redirect to the first kit if no kit is selected
        redirect(`/kits?kit=${kitData[0].id}`);
    }

    return (
        <PageLayout page="/kits">
            <KitViewer kits={kitData} initialSelectedKitId={selectedKitId} />
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
