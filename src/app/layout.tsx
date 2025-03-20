import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { PHProvider } from '@/app/providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

const RootProvider = ({ children }: RootLayoutProps) => {
    return (
        <ClerkProvider>
            <PHProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
            </PHProvider>
        </ClerkProvider>
    );
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <RootProvider>
            <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
                <body>{children}</body>
            </html>
        </RootProvider>
    );
}
