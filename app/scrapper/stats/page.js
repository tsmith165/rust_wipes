export const metadata = {
    title: 'scrapper Stats',
    description: 'Display stats on run time and servers parsed by the scrapper.',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import ScrapperStatsPage from '@/components/pages/scrapper/stats/ScrapperStatsPage';

// eslint-disable-next-line no-unused-vars
export default async function Page({ params, searchParams }) {
    return (
        <PageLayout page={'scrapper'}>
            <ScrapperStatsPage searchParams={searchParams} />
        </PageLayout>
    );
}
