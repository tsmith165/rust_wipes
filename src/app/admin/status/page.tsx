import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const metadata: Metadata = {
    title: 'Rust Wipes - Server Status',
    description: 'Admin interface for monitoring server status and performance.',
    keywords: 'rust wipes, server status, admin, monitoring',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Server Status',
        description: 'Admin interface for monitoring server status and performance.',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/admin/status',
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

import { getServerStatus } from './Status.Actions';
import { StatusContainer } from './Status.Container';
import PageLayout from '@/components/layout/PageLayout';

export default async function StatusPage() {
    // Force dynamic route and no caching
    const headersList = headers();
    const response = new NextResponse();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    const serverStatus = await getServerStatus();

    return (
        <PageLayout page="/status">
            <StatusContainer initialStatus={serverStatus} />
        </PageLayout>
    );
}

// Force dynamic behavior
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
