import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Rust Wipes - New Kit',
    description:
        'Rust Wipes helps gamers find servers based on their wipe schedules. Discover recent wipes, upcoming wipes, and scrapper statistics.',
    keywords:
        'rust, rustwipes, rust wipes, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Create Kit',
        description: 'Create Kit page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/admin/edit/new',
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

import PageLayout from '@/components/layout/PageLayout';
import CreateKit from '@/app/admin/edit/new/CreateKit';

export default function NewKitPage() {
    return (
        <PageLayout page="/edit/new">
            <CreateKit />
        </PageLayout>
    );
}

export const revalidate = 3660;
