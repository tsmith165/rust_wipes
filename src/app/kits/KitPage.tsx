import { fetchKits } from '@/app/actions';
import React from 'react';
import KitViewer from './KitViewer';
import { redirect } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';

export default async function KitPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const kitData = await fetchKits();

    if (kitData.length === 0) {
        return <div>No kits available.</div>;
    }

    const selectedKitId = searchParams.kit ? parseInt(searchParams.kit as string, 10) : null;
    const selectedType = (searchParams.type as string) || 'monthly';

    return (
        <PageLayout page="/kits">
            <KitViewer kits={kitData} initialSelectedKitId={selectedKitId} initialSelectedType={selectedType} />
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
