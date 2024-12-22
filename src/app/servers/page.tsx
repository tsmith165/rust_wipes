import React from 'react';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import { PageContent } from './PageContent';
import { fetchServers, fetchNextWipeInfo, fetchMapOptions, fetchMapVotes } from '@/app/actions';
import { captureEvent, getServerDistinctId } from '@/utils/posthog';

const PAGE_NAME = 'Our Servers';

export const metadata: Metadata = {
    title: `Rust Wipes - Our ${PAGE_NAME}`,
    description: 'View all our Rust servers and their wipe schedules.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Our Servers',
        description: 'Our Rust Wipes Servers page',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/servers',
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

export default async function Page() {
    const [servers, nextWipeInfos, mapOptions, mapVotes, distinctId] = await Promise.all([
        fetchServers(),
        fetchNextWipeInfo(),
        fetchMapOptions(),
        fetchMapVotes(),
        getServerDistinctId(),
    ]);

    captureEvent(`${PAGE_NAME} page was loaded with ID: ${distinctId}`);

    const nextWipeInfoMap = nextWipeInfos.reduce(
        (acc, info) => ({
            ...acc,
            [info.server_id]: info,
        }),
        {},
    );

    return (
        <PageLayout page={'servers'}>
            <div className="radial-gradient-stone-950 container flex max-h-full min-h-full w-full min-w-full flex-col items-center overflow-y-auto bg-primary_dark px-4 py-8">
                <h1 className="mb-8 w-fit bg-gradient-to-b from-primary_dark to-primary_light bg-clip-text text-center text-4xl font-bold text-transparent">
                    Our Servers
                </h1>
                <PageContent servers={servers} nextWipeInfoMap={nextWipeInfoMap} mapOptions={mapOptions} mapVotes={mapVotes} />
            </div>
        </PageLayout>
    );
}
