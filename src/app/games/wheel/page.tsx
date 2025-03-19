import PageLayout from '@/components/layout/PageLayout';
import { WheelContainer } from './Wheel.Container';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rust Wipes - Gambling Wheel',
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
        title: 'Rust Wipes - Gambling Wheel',
        description: 'Gambling Wheel for Rust Wipes',
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

export default function WheelPage() {
    return (
        <PageLayout page="wheel">
            <div className="relative flex flex-col md:flex-row">
                <div className="relative z-10 h-full w-full">
                    <WheelContainer />
                </div>
            </div>
        </PageLayout>
    );
}
