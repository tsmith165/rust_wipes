import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Rust Wipes - Successful Checkout',
    description: 'Successful Checkout for Rust Wipes',
    keywords:
        'rust, rustwipes, rust wipes, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list, Checkout, Success',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Checkout',
        description: 'Successful Checkout for Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/checkout',
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

import { fetchKitById } from '@/app/actions';
import { KitsWithExtraImages } from '@/db/schema';
import PageLayout from '@/components/layout/PageLayout';
import Success from '@/app/checkout/success/[id]/Success';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const current_id = parseInt((await props.params).id);
    const current_kit: KitsWithExtraImages | null = await fetchKitById(current_id);

    if (!current_kit) {
        // Handle the case where the kit is not found
        return <div>Kit not found</div>;
    }

    return (
        <PageLayout page={`/checkout/success/${current_id}`}>
            <Success current_kit={current_kit} current_id={current_id} />
        </PageLayout>
    );
}

export const revalidate = 60;
