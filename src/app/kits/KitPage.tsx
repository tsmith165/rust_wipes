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

    if (!selectedKitId) {
        // Redirect to the first kit of the selected type if no kit is selected
        const firstKitOfType = kitData.find((kit) => kit.type === selectedType);
        if (firstKitOfType) {
            redirect(`/kits?kit=${firstKitOfType.id}&type=${selectedType}`);
        } else {
            // If no kit of the selected type exists, redirect to the first kit
            redirect(`/kits?kit=${kitData[0].id}&type=${kitData[0].type}`);
        }
    }

    return (
        <PageLayout page="/kits">
            <KitViewer kits={kitData} initialSelectedKitId={selectedKitId} initialSelectedType={selectedType} />
        </PageLayout>
    );
}

export const revalidate = 60; // Revalidate this page every 60 seconds
