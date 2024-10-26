import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import PostHogPageView from '@/app/PostHogPageView';

type PageLayoutProps = {
    children: ReactNode;
    page: string;
};

export default function PageLayout({ children, page }: PageLayoutProps) {
    return (
        <div className="h-[100dvh] bg-stone-900">
            <PostHogPageView />
            <Navbar page={page} />
            <main className="h-[calc(100dvh-50px)]">{children}</main>
        </div>
    );
}
