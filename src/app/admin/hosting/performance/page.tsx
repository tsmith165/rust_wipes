import type { Metadata } from 'next';
import { getServerPerformanceData } from './actions';
import { checkUserRole } from './serverActions';
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
    const { isAdmin, error } = await checkUserRole();

    if (!isAdmin) {
        console.error(error);
        redirect('/unauthorized'); // Redirect to an unauthorized page
    }

    const initialPerformanceData = await getServerPerformanceData(250); // Default to 250 records

    return (
        <PageLayout page="/admin/hosting/performance">
            <PerformanceDisplay initialPerformanceData={initialPerformanceData} />
        </PageLayout>
    );
}

export const revalidate = 5; // revalidate every 5 seconds
