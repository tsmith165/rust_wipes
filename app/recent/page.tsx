import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import RecentConfirmedWipesPage from '@/app/recent/RecentConfirmedWipesPage';

export const metadata: Metadata = {
    metadataBase: new URL('https://rustwipes.net'),
    title: 'Rust Wipes - Recent Wipes',
    description:
        'Keep track of the servers that just wiped so you can find a fresh server to play on! We offer free auto-refresh, sound notifications, and filtering!',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

interface PageProps {
    params?: object;
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
}

export default function Page({ params, searchParams }: PageProps) {
    return (
        <PageLayout page="recent">
            <RecentConfirmedWipesPage searchParams={searchParams} />
        </PageLayout>
    );
}
