import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rust Wipes - Edit Kit Images',
    description: 'Edit images for Rust Wipes kits. Manage and update kit images efficiently.',
    keywords:
        'rust wipes, rustwipes, rust, wipes, rustwipes.net, networks, server wipes, server wipe, wipe schedules, wipe schedule, wipe, servers, server, rust servers, rust server, rust servers list, rust server list, rust server list, rust server list',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: 'Rust Wipes - Edit Kit Images',
        description: 'Edit images for Rust Wipes kits. Manage and update kit images efficiently.',
        url: 'https://rustwipes.com/admin/edit/images',
        siteName: 'Rust Wipes',
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

import PageLayout from '@/components/layout/PageLayout';
import ImageEditor from '@/app/admin/edit/images/[id]/ImageEditor';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return (
        <PageLayout page={`/edit/${params.id}`}>
            <ImageEditor kitId={params.id} />
        </PageLayout>
    );
}
