export const metadata = {
    title: 'Rust Wipes - Upcoming Wipes',
    description: 'See what wipes are coming up soon so you can plan your day!',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
    openGraph: {
        images: '/opengraoh-image.png',
    },
};

import React from 'react';
import PropTypes from 'prop-types';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/components/pages/upcoming/UpcomingWipesPage';

// eslint-disable-next-line no-unused-vars
export default async function Page({ params, searchParams }) {
    return (
        <PageLayout page={'upcoming'}>
            <UpcomingWipesPage searchParams={searchParams} />
        </PageLayout>
    );
}

Page.propTypes = {
    params: PropTypes.object,
    searchParams: PropTypes.object,
};
