import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Successful Checkout',
    description: 'Successful Checkout for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout, Success',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Successful Checkout',
        description: 'Successful Checkout for JWS Fine Art',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: [
            {
                url: '/favicon/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JWS Fine Art',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

import { fetchPieceById } from '@/app/actions';
import { PiecesWithImages } from '@/db/schema';
import PageLayout from '@/components/layout/PageLayout';
import Success from '@/app/checkout/success/[id]/Success';

export default async function Page(props: { params: { id: string } }){
    const current_id = parseInt(props.params.id);
    const current_piece: PiecesWithImages = await fetchPieceById(current_id);

    return (
        <PageLayout page={`/checkout/cancel/${current_id}`}>
            <Success current_piece={current_piece} current_id={current_id} />
        </PageLayout>
    );
}

export const revalidate = 60;
