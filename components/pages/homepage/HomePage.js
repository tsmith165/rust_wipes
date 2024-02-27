import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
    const linkData = [
        {
            href: '/upcoming',
            label: 'Upcoming Wipes',
            img: '/rust_upcoming_wipe.jpg',
        },
        {
            href: '/recent',
            label: 'Recent Wipes',
            img: '/rust_recent_wipe.jpg',
        },
        {
            href: '/networks',
            label: 'Server Networks',
            img: '/rust_server_networks.jpg',
        },
        {
            href: '/scrapper/stats',
            label: 'Scrapper Stats',
            img: '/rust_scrapper_stats.jpg',
        },
    ];

    return (
        <div className="block h-full w-full overflow-y-auto bg-dark bg-gradient-to-b from-dark to-black">
            <div className="flex max-h-full flex-col items-center justify-start space-y-5 py-5">
                <div className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-5">
                    {linkData.map((link, index) => (
                        <Link key={index} href={link.href}>
                            <div className="group h-[200px] min-w-[300px] max-w-[300px] transform cursor-pointer flex-col rounded bg-black text-grey transition-transform hover:scale-105 md:flex-1">
                                <div className="!h-[50px] rounded-t bg-black py-2.5 text-center font-bold text-primary">{link.label}</div>
                                <div className="relative !h-[150px] w-full overflow-hidden rounded-b">
                                    <Image
                                        src={link.img}
                                        alt={link.label}
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform group-hover:scale-110"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="w-full max-w-6xl rounded-lg px-5 pb-5">
                    <h2 className="mt-0 rounded-t-lg bg-black p-5 text-2xl text-primary">
                        Discover the Latest Server Wipes with rustwipes.net!
                    </h2>
                    <p className="rounded-b-lg bg-primary p-5 text-base text-grey">
                        Are you tired of jumping from one server to another trying to find a recent wipe? Rust Wipes is your go-to platform,
                        offering tools that help players identify servers based on their wipe schedules. We provide an extensive list of
                        servers that have just wiped, are about to wipe, and detailed scrapper statistics. Our free auto-refresh feature
                        ensures you get the latest data without any manual effort. Dive deep into the world of Rust and find your perfect
                        server with Rust Wipes.
                    </p>
                </div>
            </div>
        </div>
    );
}
