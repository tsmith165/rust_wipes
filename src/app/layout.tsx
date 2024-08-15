import React from 'react';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <head>
                <Script
                    src="https://willing-chigger-32.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
                    strategy="lazyOnload"
                />
            </head>
            <ClerkProvider>
                <body>{children}</body>
            </ClerkProvider>
        </html>
    );
}
