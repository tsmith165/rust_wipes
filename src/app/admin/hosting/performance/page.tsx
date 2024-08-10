import type { Metadata } from 'next';
import { getServerPerformanceData } from './serverActions';
import PageLayout from '@/components/layout/PageLayout';
import { PerformanceDisplay } from '@/app/admin/hosting/performance/PerformanceDisplay';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Rust Wipes - Server Performance',
    description: 'Monitor dedicated server performance for Rust Wipes.',
    keywords: 'rust, rustwipes, server performance, hosting',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Server Performance',
        description: 'Server Performance page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/hosting/performance',
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

export default async function PerformancePage() {
    const initialPerformanceData = await getServerPerformanceData(250); // Default to 250 records

    if (initialPerformanceData.length === 0) {
        redirect('/unauthorized'); // Redirect to an unauthorized page
    }

    return (
        <PageLayout page="/admin/hosting/performance">
            <PerformanceDisplay initialPerformanceData={initialPerformanceData} />
        </PageLayout>
    );
}

export const revalidate = 5; // revalidate every 5 seconds
