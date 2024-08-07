import type { Metadata } from 'next';
import { getInitialPerformanceData } from './serverActions';
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
        images: '/og-image.png',
    },
};

export default async function PerformancePage() {
    const initialPerformanceData = await getInitialPerformanceData(250); // Default to 250 records

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
