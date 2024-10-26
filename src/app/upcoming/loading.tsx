// File: /src/app/upcoming/loading.tsx
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';

export default function Loading() {
    return (
        <PageLayout page={'upcoming'}>
            <div className="h-full w-full overflow-hidden">
                <div className="flex h-full w-full flex-col md:flex-row">
                    {/* Sidebar skeleton */}
                    <div className="h-fit w-full bg-stone-800 md:h-full md:w-[35%] md:min-w-[35%] md:max-w-[35%]"></div>

                    {/* Main content skeleton */}
                    <div className="h-full min-w-full flex-grow overflow-y-auto bg-stone-400 md:w-[65%] md:min-w-[65%]"></div>
                </div>
            </div>
        </PageLayout>
    );
}
