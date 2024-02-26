export const metadata = {
    title: 'Rust Wipes - Homepage',
    description:
        'Rust Wipes helps gamers find servers based on their wipe schedules. Discover recent wipes, upcoming wipes, and scrapper statistics.',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import HomePage from '@/components/pages/homepage/HomePage';

export default async function Page() {
    return (
        <PageLayout page_title={'Home Page'} page={'home'}>
            <HomePage />
        </PageLayout>
    );
}
