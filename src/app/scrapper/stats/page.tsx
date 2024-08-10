import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ScrapperStatsPage from '@/app/scrapper/stats/ScrapperStatsPage';

export const metadata: Metadata = {
    title: 'Scrapper Stats',
    description: 'Display stats on run time and servers parsed by the scrapper.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, stats, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Scrapper Stats',
        description: 'Stats page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/scrapper/stats',
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
    params?: object;
    searchParams?: {
        page?: string;
    };
}

export default async function Page({ searchParams }: PageProps) {
    return (
        <PageLayout page={'scrapper'}>
            <ScrapperStatsPage searchParams={searchParams} />
        </PageLayout>
    );
}
