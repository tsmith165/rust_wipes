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
        type?: string;
    };
}

export default async function KitPage({ searchParams }: PageProps) {
    const kitData = await fetchKits();

    if (kitData.length === 0) {
        return <div>No kits available.</div>;
    }

    const selectedKitId = searchParams?.kit ? parseInt(searchParams.kit, 10) : null;
    const selectedType = searchParams?.type || 'monthly';

    if (!selectedKitId) {
        // Redirect to the first kit of the selected type if no kit is selected
        const firstKitOfType = kitData.find((kit) => kit.type === selectedType);
        if (firstKitOfType) {
            redirect(`/kits?kit=${firstKitOfType.id}&type=${selectedType}`);
        } else {
            // If no kit of the selected type exists, redirect to the first kit
            redirect(`/kits?kit=${kitData[0].id}&type=${kitData[0].type}`);
        }
    }

    return (
        <PageLayout page="/kits">
            <KitViewer kits={kitData} initialSelectedKitId={selectedKitId} initialSelectedType={selectedType} />
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
