import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rust Wipes - Edit Kit Images',
    description: 'Edit images for Rust Wipes kits. Manage and update kit images efficiently.',
    keywords: 'Rust Wipes, kit images, edit images, Rust game, server wipes',
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

export default async function Page({ params }: { params: { id: string } }) {
    return (
        <PageLayout page={`/edit/${params.id}`}>
            <ImageEditor kitId={params.id} />
        </PageLayout>
    );
}
