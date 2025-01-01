import React, { ReactNode } from 'react';
import { Suspense } from 'react';
import PostHogPageView from '@/app/PostHogPageView';
import Navbar from './Navbar/Navbar';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="h-[100dvh] bg-stone-900">
            <Suspense>
                <PostHogPageView />
            </Suspense>
            <Navbar page={page} />
            <main className="h-[calc(100dvh-50px)]">{children}</main>
        </div>
    );
}
