import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Rust Wipes - Edit Kits',
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
        title: 'Rust Wipes - Edit',
        description: 'Edit page for Rust Wipes kits',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.com/admin/edit',
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

import React, { Suspense } from 'react';
import { fetchKitById, fetchAdjacentKitIds, getMostRecentKitId } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/admin/edit/Edit';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { redirect } from 'next/navigation';
import { KitsWithExtraImages } from '@/db/schema';

// Import the KitData interface from Edit.tsx
interface KitData extends KitsWithExtraImages {
    next_id?: number;
    last_id?: number;
}

async function fetchKitData(id: number): Promise<KitData> {
    const kit = await fetchKitById(id);
    if (!kit) {
        throw new Error(`Kit with ID ${id} not found`);
    }

    const { next_id, last_id } = await fetchAdjacentKitIds(id);

    // Ensure all required properties exist with proper types
    return {
        ...kit,
        next_id,
        last_id,
        description: kit.description ?? null,
        id: kit.id,
        name: kit.name ?? '',
        image_path: kit.image_path ?? '',
        small_image_path: kit.small_image_path ?? '',
        width: kit.width ?? 0,
        height: kit.height ?? 0,
        small_width: kit.small_width ?? 0,
        small_height: kit.small_height ?? 0,
        extraImages: kit.extraImages ?? [],
    };
}

export default async function Page(props: { searchParams: Promise<{ id?: string }> }) {
    const searchParams = await props.searchParams;
    const id = searchParams.id ? parseInt(searchParams.id, 10) : null;

    if (!id) {
        // Fetch the most recent ID if no ID is provided
        const mostRecentId = await getMostRecentKitId();
        if (mostRecentId) {
            redirect(`/admin/edit?id=${mostRecentId}`);
        } else {
            return (
                <PageLayout page="edit">
                    <div className="text-center text-xl">No kits found</div>
                </PageLayout>
            );
        }
    }

    const kitDataPromise = fetchKitData(id);

    return (
        <PageLayout page="edit">
            <Suspense fallback={<LoadingSpinner page="Edit" />}>
                <Edit kitDataPromise={kitDataPromise} current_id={id} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
