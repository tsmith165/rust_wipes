import React from 'react';

import '@/styles/globals/globals.scss';
import 'tailwindcss/tailwind.css';

import AppLayout from '@/components/layout/AppLayout';

export default function RootLayout({children, params }) {
    console.log(`Loading Root Layout...`)

    return (
        <>
            <AppLayout>
                {children}
            </AppLayout>
        </>
    );
}