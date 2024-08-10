import type { Metadata } from 'next';
import { getKits } from './actions';
import PageLayout from '@/components/layout/PageLayout';
import { Tests } from '@/app/admin/test/Tests';

export const metadata: Metadata = {
    title: 'Rust Wipes - Admin Test Tools',
    description: 'Test tools for Rust Wipes administration.',
    keywords: 'rust, rustwipes, admin, test tools',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Test Tools',
        description: 'Test Tools page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/admin/test',
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

interface PageProps {
    searchParams?: {
        tab?: string;
    };
}

export default async function TestPage({ searchParams }: PageProps) {
    const tab = searchParams?.tab || 'kit-access';
    const kits = await getKits();

    return (
        <PageLayout page="/admin/test">
            <Tests kits={kits} activeTab={tab} />
        </PageLayout>
    );
}

export const revalidate = 60; // disable cache for this page
