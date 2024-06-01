export const metadata = {
    metadataBase: new URL('https://rustwipes.net'),
    title: 'Rust Wipes - Homepage',
    description:
        'Rust Wipes helps gamers find servers based on their wipe schedules. Discover recent wipes, upcoming wipes, and scrapper statistics.',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
    openGraph: {
        images: '/opengraoh-image.png',
    },
};

import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import HomePage from '@/app/HomePage';

export default async function Page() {
    return (
        <PageLayout page={'home'}>
            <HomePage />
        </PageLayout>
    );
}
