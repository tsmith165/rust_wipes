import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rust Wipes - Checkout',
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
        title: 'Rust Wipes - Checkout',
        description: 'Checkout page for Rust Wipes kits',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com',
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
import Checkout from '@/app/checkout/[id]/Checkout';

export default async function Page(props: { params: { id: string } }) {
    const current_id = parseInt(props.params.id);
    const current_kit: KitsWithExtraImages | null = await fetchKitById(current_id);

    if (!current_kit) {
        // Handle the case where the kit is not found
        return <div>Kit not found</div>;
    }

    return (
        <PageLayout page={`/checkout/${props.params.id}`}>
            <Checkout current_kit={current_kit} current_id={current_id} />
        </PageLayout>
    );
}

export const revalidate = 60;
