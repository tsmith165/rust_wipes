import React, { ReactNode } from 'react';
import Navbar from './Navbar';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="p-0">
            <main className="bg-secondary_light min-h-full">
                <Navbar page={page} />
                <div className="relative h-[calc(100vh-97px)] w-full md-nav:h-[calc(100vh-100px)]">{children}</div>
            </main>
        </div>
    );
}