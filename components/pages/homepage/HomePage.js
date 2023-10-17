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
        { href: '/upcoming', label: 'Upcoming Wipes', img: '/rust_upcoming_wipe.jpg' },
        { href: '/recent', label: 'Recent Wipes', img: '/rust_recent_wipe.jpg' },
        { href: '/networks', label: 'Server Networks', img: '/rust_server_networks.jpg' },
        { href: '/scraper/stats', label: 'Scraper Stats', img: '/rust_scraper_stats.jpg' },
    ];

    return (
        <div className="h-full w-full bg-medium block">
            <div className="flex flex-col items-center justify-start overflow-y-auto max-h-fullspace-y-5 py-5">
                <div className="w-full max-w-6xl rounded-lg pb-5">
                    <h2 className="text-2xl mt-0 text-dark bg-tertiary p-5 rounded-t-lg">
                        Discover the Latest Server Wipes with rustwipes.net!
                    </h2>
                    <p className="text-base p-5 text-light bg-dark rounded-b-lg">
                        Are you tired of jumping from one server to another trying to find a recent
                        wipe? Rust Wipes is your go-to platform, offering tools that help players
                        identify servers based on their wipe schedules. We provide an extensive list
                        of servers that have just wiped, are about to wipe, and detailed scraper
                        statistics. Our free auto-refresh feature ensures you get the latest data
                        without any manual effort. Dive deep into the world of Rust and find your
                        perfect server with Rust Wipes.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-5 w-full max-w-6xl">
                    {linkData.map((link, index) => (
                        <div
                            key={index}
                            className="flex-1 bg-dark text-light rounded transform transition-transform hover:scale-105 cursor-pointer min-w-[300px] max-w-[300px] h-[200px]"
                            onClick={(e) => handle_link_clicked(link.href, e)}>
                            <div className="bg-tertiary text-center font-bold py-2.5 rounded-t text-light">
                                {link.label}
                            </div>
                            <div className="w-full h-[150px] p-2.5 bg-cover bg-center transition-transform hover:scale-110">
                                <img
                                    className="w-full h-full object-cover"
                                    src={link.img}
                                    alt={link.label}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="fixed top-[100px] left-0 right-0 bottom-0 bg-black z-50 opacity-0 animate-fadeIn hidden"
                ref={overlayRef}></div>
        </div>
    );
};

export default HomePage;
