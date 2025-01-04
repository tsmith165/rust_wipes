import type { Metadata } from 'next';

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
import { headers } from 'next/headers';

export default async function StatusPage() {
    // Get headers outside of cached function
    headers();
    const serverStatus = await getServerStatus();

    return (
        <PageLayout page="/status">
            <StatusContainer initialStatus={serverStatus} />
        </PageLayout>
    );
}

// This is still useful for static generation intervals
export const revalidate = 60;
