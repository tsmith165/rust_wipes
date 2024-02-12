'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAnalytics } from '@/lib/helpers/useAnalytics';

const HomePage = () => {
    useAnalytics();

    const overlayRef = useRef(null);
    const router = useRouter();
    const [redirectTo, setRedirectTo] = useState(null);

    const handle_link_clicked = (href, event) => {
        event.preventDefault();
        setRedirectTo(href);
    };

    useEffect(() => {
        if (redirectTo) {
            overlayRef.current.style.display = 'block';
            setTimeout(() => {
                router.push(redirectTo);
            }, 1000);
        }
    }, [redirectTo]);

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
        <div className="block h-full w-full overflow-y-auto bg-dark ">
            <div className="justify-startmax-h-fullspace-y-5 flex flex-col items-center py-5">
                <div className="w-full max-w-6xl rounded-lg px-5 pb-5">
                    <h2 className="mt-0 rounded-t-lg bg-secondary p-5 text-2xl text-black">
                        Discover the Latest Server Wipes with rustwipes.net!
                    </h2>
                    <p className="rounded-b-lg bg-black p-5 text-base text-grey">
                        Are you tired of jumping from one server to another trying to find a recent wipe? Rust Wipes is your go-to platform,
                        offering tools that help players identify servers based on their wipe schedules. We provide an extensive list of
                        servers that have just wiped, are about to wipe, and detailed scrapper statistics. Our free auto-refresh feature
                        ensures you get the latest data without any manual effort. Dive deep into the world of Rust and find your perfect
                        server with Rust Wipes.
                    </p>
                </div>

                <div className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-5">
                    {linkData.map((link, index) => (
                        <div
                            key={index}
                            className="h-[200px] min-w-[300px] max-w-[300px] flex-1 transform cursor-pointer rounded bg-black text-grey transition-transform hover:scale-105"
                            onClick={(e) => handle_link_clicked(link.href, e)}
                        >
                            <div className="rounded-t bg-secondary py-2.5 text-center font-bold text-grey">{link.label}</div>
                            <div className="h-[150px] w-full bg-cover bg-center p-2.5 transition-transform hover:scale-110">
                                <img className="h-full w-full object-cover" src={link.img} alt={link.label} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 top-[100px] z-50 hidden animate-fadeIn bg-black opacity-0" ref={overlayRef}></div>
        </div>
    );
};

export default HomePage;
