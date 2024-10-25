import React, { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';
import { PHProvider } from '@/app/providers';
import PostHogPageView from './PostHogPageView';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <ClerkProvider>
            <html lang="en">
                <PHProvider>
                    <body>
                        <Suspense fallback={null}>
                            <PostHogPageView />
                        </Suspense>
                        {children}
                    </body>
                </PHProvider>
            </html>
        </ClerkProvider>
    );
}
