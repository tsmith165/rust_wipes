import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { NetworksDisplay } from './Networks.Main';
import { getNetworksData } from './networkActions';
import { createSearchParamsCache, parseAsInteger, parseAsString, type SearchParams } from 'nuqs/server';

import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Server Networks - Rust Wipes',
    description: 'Discover various server networks on Rust Wipes.',
};

// Define the search params cache
const searchParamsCache = createSearchParamsCache({
    networkId: parseAsInteger.withDefault(0),
    region: parseAsString.withDefault('US'),
});

export default async function Networks({ searchParams }: { searchParams: Promise<SearchParams> }) {
    console.log('Page render - searchParams:', searchParams);

    // Parse the search params after awaiting them
    const params = await searchParamsCache.parse(searchParams);
    const networks = await getNetworksData();

    console.log('Page render - params:', params);
    console.log('Page render - networkId:', params.networkId);
    console.log('Page render - networks length:', networks.length);

    return (
        <PageLayout page={'networks'}>
            <NetworksDisplay networks={networks} selectedNetworkId={params.networkId} />
        </PageLayout>
    );
}

// These ensure the page is always server-rendered with fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
