import React from 'react';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import Servers from './Servers';

export const metadata: Metadata = {
    title: 'Rust Wipes - Our Servers',
    description: 'View all our Rust servers and their wipe schedules.',
    keywords: 'rust, servers, wipe schedules, rust wipes',
};

export default function Page() {
    return (
        <PageLayout page={'servers'}>
            <Servers />
        </PageLayout>
    );
}
