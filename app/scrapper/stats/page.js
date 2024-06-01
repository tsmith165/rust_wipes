export const metadata = {
    title: 'scrapper Stats',
    description: 'Display stats on run time and servers parsed by the scrapper.',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';
import PropTypes from 'prop-types';
import PageLayout from '@/components/layout/PageLayout';
import ScrapperStatsPage from '@/app/scrapper/stats/ScrapperStatsPage';

// eslint-disable-next-line no-unused-vars
export default async function Page({ params, searchParams }) {
    return (
        <PageLayout page={'scrapper'}>
            <ScrapperStatsPage searchParams={searchParams} />
        </PageLayout>
    );
}

Page.propTypes = {
    params: PropTypes.object,
    searchParams: PropTypes.object,
};
