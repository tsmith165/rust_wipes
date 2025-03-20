import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Suspense } from 'react';
import PostHogPageView from '@/app/PostHogPageView';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="h-[100dvh] bg-stone-900 font-sans">
            <Suspense>
                <PostHogPageView />
            </Suspense>
            <Navbar page={page} />
            <main className="h-[calc(100dvh-50px)]">{children}</main>
        </div>
    );
}
