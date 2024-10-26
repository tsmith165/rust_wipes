import React, { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';
import { PHProvider } from '@/app/providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

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
            <html lang="en">
                <body>{children}</body>
            </html>
        </RootProvider>
    );
}
