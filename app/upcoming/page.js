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

// This fetch function runs on the server and has access to the request object
export async function fetch({ request }) {
    // Get the URL from the request
    const url = new URL(request.url);

    // Extract search parameters from the URL
    const searchParams = Object.fromEntries(url.searchParams);

    // Pass the search parameters as props to your server component
    return {
        props: {
            filters: searchParams,
        },
    };
}

export default async function Page({ filters }) {
    return (
        <PageLayout page_title={'Upcoming Wipes'} page={'upcoming'}>
            <UpcomingWipesPage filters={filters} />
        </PageLayout>
    );
}
