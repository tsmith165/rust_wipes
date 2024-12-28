import React from 'react';
import { createSearchParamsCache, parseAsInteger } from 'nuqs/server';
import { getNetworksData } from '@/app/networks/Networks.Actions';
import { NetworksContainer } from '@/app/networks/Networks.Container';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
export const metadata: Metadata = {
    title: 'Server Networks - Rust Wipes',
    description: 'Discover various server networks on Rust Wipes.',
};

// Define the search params cache with type-safe parsing
const searchParamsCache = createSearchParamsCache({
    networkId: parseAsInteger.withDefault(0),
});

interface NetworksPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NetworksPage({ searchParams }: NetworksPageProps) {
    const networks = await getNetworksData();
    const params = await searchParamsCache.parse(searchParams);
    const selectedNetworkId = params.networkId || networks[0]?.id || 0;

    return (
        <PageLayout page="/networks">
            <div className="h-full w-full">
                <NetworksContainer networks={networks} selectedNetworkId={selectedNetworkId} />
            </div>
        </PageLayout>
    );
}

// These ensure the page is always server-rendered with fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
