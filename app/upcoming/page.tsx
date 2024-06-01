import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UpcomingWipesPage from '@/app/upcoming/UpcomingWipesPage';

export const metadata: Metadata = {
    title: 'Rust Wipes - Upcoming Wipes',
    description: 'See what wipes are coming up soon so you can plan your day!',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
    openGraph: {
        images: '/opengraoh-image.png',
    },
};

interface PageProps {
    params?: object;
    searchParams?: {
        [key: string]: string | string[];
    };
}

export default async function Page({ params, searchParams }: PageProps) {
    return (
        <PageLayout page={'upcoming'}>
            <UpcomingWipesPage searchParams={searchParams || {}} />
        </PageLayout>
    );
}
