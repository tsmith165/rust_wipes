'use client';

import React from 'react';
import Link from 'next/link';

interface LinkData {
    href: string;
    label: string;
}

export default function HomePage() {
    const linkData: LinkData[] = [
        {
            href: '/servers',
            label: 'Our Servers',
        },
        {
            href: '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US',
            label: 'Recent Wipes',
        },
        {
            href: '/upcoming',
            label: 'Upcoming Wipes',
        },
    ];

    return (
        <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-secondary bg-gradient-to-b from-secondary to-secondary_dark">
            <div className="w-70% flex h-fit flex-col items-center justify-center">
                <h1 className="pb-8 text-4xl text-stone-300 md:text-6xl">
                    {`Find Your `}
                    <span
                        className={`w-fit bg-gradient-to-r from-primary_dark via-primary_light to-primary_dark bg-clip-text text-transparent`}
                    >
                        Perfect
                    </span>
                    {` Wipe`}
                </h1>
                <div className="flex flex-row space-x-4">
                    {linkData.map((link, index) => (
                        <Link key={index} href={link.href}>
                            <button className="rounded-md bg-gradient-to-b from-stone-300 to-stone-500 p-2 text-stone-950 hover:from-primary_light hover:to-primary_dark hover:text-stone-300">
                                {link.label}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
