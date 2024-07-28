import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Rust Wipes - Sign In',
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
        images: '/og-image.png',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import Sign_In from '@/app/signin/Sign_In';

export default async function Page() {
    return (
        <PageLayout page="/signin">
            <Sign_In />
        </PageLayout>
    );
}

export const revalidate = 3600;
