import { fetchKits } from '@/app/kits/actions';
import React from 'react';
import KitViewer from './KitViewer';

export default async function KitPage() {
    const kitData = await fetchKits();

    return <KitViewer kits={kitData} />;
}

export const revalidate = 60; // Revalidate this page every 60 seconds
