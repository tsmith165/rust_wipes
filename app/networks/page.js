// /app/networks/page.js
export const metadata = {
    title: 'Server Networks - Rust Wipes',
    description:
        'Discover various server networks on Rust Wipes. Explore different communities and find the perfect place to enjoy your game.',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';

import PageLayout from '@/components/layout/PageLayout';
import NetworksPage from '@/components/pages/networks/NetworksPage';

export default function Networks() {
    return (
        <PageLayout page_title={'Server Networks'} page={'networks'}>
            <NetworksPage />
        </PageLayout>
    );
}
