import React from 'react';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Servers from './Servers';

export const metadata: Metadata = {
    title: 'Rust Wipes - Our Servers',
    description: 'View all our Rust servers and their wipe schedules.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Our Servers',
        description: 'Our Rust Wipes Servers page',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/servers',
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

export default function Page() {
    return (
        <PageLayout page={'servers'}>
            <Servers />
        </PageLayout>
    );
}
