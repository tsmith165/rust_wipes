import React from 'react';

import { ClerkProvider } from '@clerk/nextjs';

import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    console.log(`Loading Root Layout...`);

    return (
        <ClerkProvider>
            <html lang="en">
                <body>{children}</body>
            </html>
        </ClerkProvider>
    );
}
