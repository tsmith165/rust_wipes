import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import RecentConfirmedWipesPage from '@/app/recent/RecentConfirmedWipesPage';

export const metadata: Metadata = {
    metadataBase: new URL('https://rustwipes.net'),
    title: 'Rust Wipes - Recent Wipes',
    description:
        'Keep track of the servers that just wiped so you can find a fresh server to play on! We offer free auto-refresh, sound notifications, and filtering!',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Recent Wipes',
        description: 'Recent Wipes page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/recent',
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

export default function Page() {
    return (
        <PageLayout page="recent">
            <RecentConfirmedWipesPage />
        </PageLayout>
    );
}
