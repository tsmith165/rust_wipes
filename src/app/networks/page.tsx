export const metadata = {
    title: 'Server Networks - Rust Wipes',
    description:
        'Discover various server networks on Rust Wipes. Explore different communities and find the perfect place to enjoy your game.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Networks',
        description: 'Server Networks for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Rust Wipes',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import NetworksData from './NetworksData';

export default function Networks() {
    return (
        <PageLayout page={'networks'}>
            <NetworksData />
        </PageLayout>
    );
}
