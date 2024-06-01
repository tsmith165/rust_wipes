export const metadata = {
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

import React from 'react';
import PropTypes from 'prop-types';
import PageLayout from '@/components/layout/PageLayout';
import RecentConfirmedWipesPage from '@/app/recent/RecentConfirmedWipesPage';

// eslint-disable-next-line no-unused-vars
export default function Page({ params, searchParams }) {
    return (
        <PageLayout page="recent">
            <RecentConfirmedWipesPage searchParams={searchParams} />
        </PageLayout>
    );
}

Page.propTypes = {
    params: PropTypes.object,
    searchParams: PropTypes.object,
};
