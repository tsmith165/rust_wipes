import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { fetchServers } from '@/app/actions';

export const metadata: Metadata = {
    title: 'Rust Wipes - Servers',
    description: 'View detailed information about Rust servers, including player count, wipe schedules, and more.',
    keywords: 'rust, servers, wipes, player count, rust wipes, server details',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Servers',
        description: 'Explore Rust servers and their details on Rust Wipes',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/server',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Rust Wipes Servers',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default async function ServerRedirectPage() {
    const servers = await fetchServers();

    if (servers.length > 0) {
        redirect(`/server/${servers[0].id}`);
    } else {
        // Handle the case where no servers are found
        redirect('/'); // or to an error page
    }
}

export const dynamic = 'force-dynamic';
