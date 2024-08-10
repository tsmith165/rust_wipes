import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Rust Wipes - Sign Out',
    description:
        'Rust Wipes helps gamers find servers based on their wipe schedules. Discover recent wipes, upcoming wipes, and scrapper statistics.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, signiut, sign out, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Sign Out',
        description: 'Sign Out page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/signup',
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
import SignOut from '@/app/signout/SignOut';

export default async function Page() {
    return (
        <PageLayout page="/signup">
            <SignOut />
        </PageLayout>
    );
}

export const revalidate = 3600;
