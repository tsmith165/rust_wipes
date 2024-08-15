import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMostRecentKitId } from '@/app/actions';

export const metadata: Metadata = {
    title: 'Rust Wipes - Checkout',
    description: 'Purchase kits and items for Rust servers. Enhance your gameplay with our selection of Rust items.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Checkout',
        description: 'Checkout page for Rust Wipes kits and items',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/checkout',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Rust Wipes Checkout',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default async function CheckoutRedirectPage() {
    const mostRecentKitId = await getMostRecentKitId();

    if (mostRecentKitId) {
        redirect(`/checkout/${mostRecentKitId}`);
    } else {
        // Handle the case where no active kits are found
        redirect('/'); // or to an error page
    }
}

export const dynamic = 'force-dynamic';
