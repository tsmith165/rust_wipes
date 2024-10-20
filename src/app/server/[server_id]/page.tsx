import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ServerInfoPage from '@/app/server/ServerInfoPage';

import { captureEvent, captureDistictId } from '@/utils/posthog';

const PAGE_NAME = 'Our Servers';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description: 'Detailed information about the specific Rust server',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes - Server Details',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Server Details',
        description: 'Server Details page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/server',
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

interface ServerPageProps {
    params?: {
        server_id?: string;
    };
    searchParams?: {
        [key: string]: string | string[];
    };
}

export default async function ServerPage({ params, searchParams }: ServerPageProps) {
    const distinctId = await captureDistictId();
    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    return (
        <PageLayout page={'server'}>
            <ServerInfoPage params={params} />
        </PageLayout>
    );
}
