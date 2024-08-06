import type { Metadata } from 'next';
import { fetchPlayerStats } from '@/app/actions';
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
        images: '/og-image.png',
    },
};

interface PageProps {
    searchParams?: {
        category?: string;
    };
}

export default async function StatsPage({ searchParams }: PageProps) {
    const playerStats = await fetchPlayerStats();
    const selectedCategory = searchParams?.category || 'kills';

    return (
        <PageLayout page="/stats">
            <StatsViewer playerStats={playerStats} initialSelectedCategory={selectedCategory} />
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
