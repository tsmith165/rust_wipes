import type { Metadata } from 'next';
import { getServerPerformanceData } from './actions';
import PageLayout from '@/components/layout/PageLayout';
import { PerformanceDisplay } from '@/app/admin/hosting/performance/PerformanceDisplay';

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
    const performanceData = await getServerPerformanceData();

    return (
        <PageLayout page="/admin/hosting/performance">
            <PerformanceDisplay performanceData={performanceData} />
        </PageLayout>
    );
}

export const revalidate = 5; // revalidate every 5 seconds
