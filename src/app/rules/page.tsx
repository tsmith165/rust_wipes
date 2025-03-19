import type { Metadata } from 'next';
import Rules from './Rules';
import PageLayout from '@/components/layout/PageLayout';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'RustWipes.net - Server Rules',
    description: 'Rules for the RustWipes.net servers. Our rules are designed to ensure a fair and enjoyable experience for all players.',
    keywords: 'rust, rustwipes, rust wipes, server rules, rust server rules, pvp rules, building rules, raid rules',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'RustWipes.net - Server Rules',
        description: 'Rules for the RustWipes.net servers',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/rules',
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

export default function RulesPage() {
    return (
        <PageLayout page="/rules">
            <Suspense
                fallback={
                    <div className="radial-gradient-stone-600 flex h-full w-full flex-col items-center justify-center bg-stone-950"></div>
                }
            >
                <Rules />
            </Suspense>
        </PageLayout>
    );
}
