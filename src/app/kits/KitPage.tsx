import { fetchKits } from '@/app/actions';
import React from 'react';
import KitViewer from './KitViewer';
import { redirect } from 'next/navigation';

export default async function KitPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const kitData = await fetchKits();

    if (kitData.length === 0) {
        return <div>No kits available.</div>;
    }

    const selectedKitId = searchParams.kit ? parseInt(searchParams.kit as string, 10) : null;

    if (!selectedKitId) {
        // Redirect to the first kit if no kit is selected
        redirect(`/kits?kit=${kitData[0].id}`);
    }

    return <KitViewer kits={kitData} initialSelectedKitId={selectedKitId} />;
}

export const revalidate = 60; // Revalidate this page every 60 seconds
