export const metadata = {
    title: 'Rust Wipes - Recent Wipes',
    description:
        'Keep track of the servers that just wiped so you can find a fresh server to play on!\n  We offer free auto-refresh, sound notifications, and filtering!',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import RecentConfirmedWipesPage from '@/components/pages/recent/RecentConfirmedWipesPage';

export default async function Page() {
    return (
        <PageLayout page_title={'Recent Wipes'} page={'recent'}>
            <RecentConfirmedWipesPage />
        </PageLayout>
    );
}
