import SlotMachine from './SlotMachine';
import PageLayout from '@/components/layout/PageLayout';
import type { Metadata } from 'next';
import Image from 'next/image'; // Import Image

export const metadata: Metadata = {
    title: 'Rust Wipes - Slot Machine',
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
        title: 'Rust Wipes - Slot Machine',
        description: 'Slot Machine for Rust Wipes',
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

export default function SlotMachinePage() {
    return (
        <PageLayout page="/gambling/slot-machine">
            <div className="relative flex flex-col md:flex-row">
                {/* Background Image */}
                <Image
                    src="/rust_hazmat_icon_large.png"
                    alt="Rust Hazmat Background"
                    width={512}
                    height={512}
                    className="absolute left-0 top-1/2 z-0 -translate-y-1/2 transform opacity-80"
                />
                <div className="relative z-10 h-full w-full">
                    <SlotMachine />
                </div>
            </div>
        </PageLayout>
    );
}
