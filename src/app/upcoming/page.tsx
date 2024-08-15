import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/app/upcoming/UpcomingWipesPage';

export const metadata: Metadata = {
    title: 'Rust Wipes - Upcoming Wipes',
    description: 'See what wipes are coming up soon so you can plan your day!',
    keywords:
        'rust, rustwipes, rust wipes, server wipes, signup, sign up, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Upcoming Wipes',
        description: 'Upcoming Wipes page for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/upcoming',
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

export default async function Page() {
    return (
        <PageLayout page={'upcoming'}>
            <UpcomingWipesPage />
        </PageLayout>
    );
}
