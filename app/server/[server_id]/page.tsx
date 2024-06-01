import { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ServerInfoPage from '@/app/server/ServerInfoPage';

export const metadata: Metadata = {
    title: 'Rust Wipes - Server Details',
    description: 'Detailed information about the specific Rust server',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

interface ServerPageProps {
    params?: {
        server_id?: string;
    };
    searchParams?: {
        [key: string]: string | string[];
    };
}

export default function ServerPage({ params, searchParams }: ServerPageProps) {
    return (
        <PageLayout page={'server'}>
            <ServerInfoPage params={params} />
        </PageLayout>
    );
}
