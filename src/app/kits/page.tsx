import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { fetchKits } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import dynamic from 'next/dynamic';

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
        title: 'Rust Wipes - Kits',
        description: 'Kits for Rust Wipes',
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

const DynamicKitViewer = dynamic(() => import('./KitViewer'), {
    loading: () => <div className="h-full w-full bg-stone-800">Loading...</div>,
});

interface PageProps {
    searchParams?: {
        kit?: string;
        type?: string;
    };
}

async function KitData({
    initialSelectedKitId,
    initialSelectedType,
}: {
    initialSelectedKitId: number | null;
    initialSelectedType: string;
}) {
    const kitData = await fetchKits();

    if (kitData.length === 0) {
        return <div>No kits available.</div>;
    }

    return <DynamicKitViewer kits={kitData} initialSelectedKitId={initialSelectedKitId} initialSelectedType={initialSelectedType} />;
}

export default function KitPage({ searchParams }: PageProps) {
    const selectedKitId = searchParams?.kit ? parseInt(searchParams.kit, 10) : null;
    const selectedType = searchParams?.type || 'monthly';

    return (
        <PageLayout page="/kits">
            <Suspense fallback={<div className="h-full w-full bg-stone-800">Loading...</div>}>
                <KitData initialSelectedKitId={selectedKitId} initialSelectedType={selectedType} />
            </Suspense>
        </PageLayout>
    );
}
