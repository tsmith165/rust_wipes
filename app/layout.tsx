import React from 'react';
import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    console.log(`Loading Root Layout...`);

    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
