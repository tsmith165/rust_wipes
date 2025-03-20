// File: /src/app/upcoming/loading.tsx
import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-st_darkest">
            {/* Hero Section Placeholder */}
            <div className="flex h-80 items-center justify-center bg-st_darkest">
                <div className="container mx-auto px-4">
                    <div className="h-12 w-64 animate-pulse rounded-lg bg-st_dark"></div>
                    <div className="mt-4 h-6 w-96 animate-pulse rounded-lg bg-st_dark"></div>
                </div>
            </div>

            {/* Filter Form Section Placeholder */}
            <section className="bg-st_darkest py-10">
                <div className="container mx-auto px-4">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-st_dark"></div>
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 animate-pulse rounded-lg bg-st_dark"></div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Servers Table Section Placeholder */}
            <section className="bg-st_darkest py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="h-8 w-64 animate-pulse rounded-lg bg-st_dark"></div>
                        <div className="h-8 w-48 animate-pulse rounded-lg bg-st_dark"></div>
                    </div>
                    <div className="h-96 animate-pulse rounded-lg bg-st"></div>
                </div>
            </section>
        </div>
    );
}
