import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rust Wipes - Alerts Management',
    description: 'Admin interface for managing system alerts and notifications.',
    keywords: 'rust wipes, alerts, admin, management',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Alerts Management',
        description: 'Admin interface for managing system alerts and notifications.',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/admin/alerts',
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

import { getAlerts } from './Alerts.Actions';
import { AlertsContainer } from './Alerts.Container';
import PageLayout from '@/components/layout/PageLayout';
import { headers } from 'next/headers';

export default async function AlertsPage() {
    // Get headers outside of cached function
    headers();
    const alerts = await getAlerts();

    return (
        <PageLayout page="/alerts">
            <AlertsContainer initialAlerts={alerts} />
        </PageLayout>
    );
}

// This is still useful for static generation intervals
export const revalidate = 60;
