export const metadata = {
    title: 'Rust Wipes - Upcoming Wipes',
    description: 'See what wipes are coming up soon so you can plan your day!',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/components/pages/upcoming/UpcomingWipesPage';

// eslint-disable-next-line no-unused-vars
export default async function Page({ params, searchParams }) {
    return (
        <PageLayout page_title={'Upcoming Wipes'} page={'upcoming'}>
            <UpcomingWipesPage searchParams={searchParams} />
        </PageLayout>
    );
}
