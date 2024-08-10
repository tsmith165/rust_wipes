import type { Metadata } from 'next';
import { fetchPlayerStats, fetchServerInfo } from '@/app/actions';
import React from 'react';
import StatsViewer from './StatsViewer';
import PageLayout from '@/components/layout/PageLayout';

export const metadata: Metadata = {
    title: 'Rust Wipes - Player Stats',
    description: 'View player statistics for Rust Wipes servers, including kills, farming, and gambling stats.',
    keywords: 'rust, rustwipes, player stats, leaderboard, kills, farming, gambling',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Player Stats',
        description: 'Player Stats page for Rust Wipes',
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

interface PageProps {
    searchParams?: {
        category?: string;
        server?: string;
    };
}

export default async function StatsPage({ searchParams }: PageProps) {
    const serverInfo = await fetchServerInfo();
    const selectedCategory = searchParams?.category || 'kills';
    const selectedServer = searchParams?.server || serverInfo[0]?.id;

    const playerStats = await fetchPlayerStats(selectedServer);

    return (
        <PageLayout page="/stats">
            <StatsViewer
                playerStats={playerStats}
                initialSelectedCategory={selectedCategory}
                serverInfo={serverInfo}
                initialSelectedServer={selectedServer}
            />
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
