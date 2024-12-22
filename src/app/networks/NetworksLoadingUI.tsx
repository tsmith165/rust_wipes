import React from 'react';

export default function NetworksLoadingUI() {
    return (
        <div className="flex h-full w-full">
            {/* Left Column - Network List */}
            <div className="flex w-[20%] min-w-[250px] flex-col bg-stone-800 p-2">
                {/* Loading skeleton for networks */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="mb-2 animate-pulse rounded bg-stone-700 p-4">
                        <div className="h-4 w-3/4 rounded bg-stone-600"></div>
                        <div className="mt-2 h-3 w-1/2 rounded bg-stone-600"></div>
                    </div>
                ))}
            </div>

            {/* Right Column */}
            <div className="flex-grow bg-stone-500 p-4">
                <div className="animate-pulse rounded-lg bg-stone-800 p-4">
                    <div className="mb-4 h-8 w-1/3 rounded bg-stone-700"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 rounded bg-stone-700"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
