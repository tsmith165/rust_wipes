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
import NetworksPage from '@/app/networks/NetworksPage';

export default function Networks() {
    return (
        <PageLayout page={'networks'}>
            <NetworksPage />
        </PageLayout>
    );
}
