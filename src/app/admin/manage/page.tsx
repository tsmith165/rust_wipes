import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Rust Wipes - Manage Kits',
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
        title: 'Rust Wipes - Manage Kits',
        description: 'Manage Kits page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/admin/manage',
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

import { getKits, getArchivedKits, getPrioritizedKits } from './actions';

import PageLayout from '@/components/layout/PageLayout';
import { Manage } from '@/app/admin/manage/Manage';

interface PageProps {
    searchParams?: {
        tab?: string;
    };
}

export default async function ManagePage({ searchParams }: PageProps) {
    const tab = searchParams?.tab || 'manage';
    const kits = await getKits();
    const archivedKits = await getArchivedKits();
    const prioritizedKits = await getPrioritizedKits();

    return (
        <PageLayout page="/manage">
            <Manage kits={kits} archivedKits={archivedKits} prioritizedKits={prioritizedKits} activeTab={tab} />
        </PageLayout>
    );
}

export const revalidate = 60; // disable cache for this page
