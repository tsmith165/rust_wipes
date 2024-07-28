import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ScrapperStatsPage from '@/app/scrapper/stats/ScrapperStatsPage';

export const metadata: Metadata = {
    title: 'Scrapper Stats',
    description: 'Display stats on run time and servers parsed by the scrapper.',
    icons: {
        icon: '/rust_hazmat_icon.png',
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
