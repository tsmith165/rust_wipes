'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GiveawayOverlay } from '@/components/overlays/giveaway/GiveawayOverlay';
import { images, toolsData, serverFinderData, serverData } from '@/app/Home.Constants';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface LinkData {
    href: string;
    label: string;
}

export default function HomePage() {
    const [isImageVisible, setImageVisible] = useState(true);
    const [showGiveaway, setShowGiveaway] = useState(true);
    const currentImageIndexRef = useRef(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const linkData: LinkData[] = [
        { href: '/servers', label: 'Our Servers' },
        { href: '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US', label: 'Recent Wipes' },
        { href: '/upcoming', label: 'Upcoming Wipes' },
    ];

    useEffect(() => {
        const interval = setInterval(async () => {
            setImageVisible(false);
            await delay(1500);
            currentImageIndexRef.current = (currentImageIndexRef.current + 1) % images.length;
            setImageVisible(true);
        }, 5500);

        return () => clearInterval(interval);
    }, []);

    const circularFadeVariants = {
        hidden: {
            background: 'radial-gradient(circle, transparent 0%, rgba(23, 23, 23, 0) 60%)',
        },
        visible: {
            background: 'radial-gradient(circle, transparent 20%, rgba(23, 23, 23, 1) 100%)',
            transition: { duration: 2 },
        },
    };

    return (
        <div ref={contentRef} className="top-[50px] h-[calc(100dvh-50px)] w-full overflow-y-auto">
            <GiveawayOverlay isOpen={showGiveaway} onClose={() => setShowGiveaway(false)} containerRef={contentRef} className="" />

            <div className="relative h-[60vh] w-full overflow-hidden">
                <AnimatePresence>
                    {isImageVisible && (
                        <motion.div
                            key={currentImageIndexRef.current}
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: 1, scale: 1.3 }}
                            exit={{ opacity: 0, scale: 1 }}
                            transition={{ duration: 3 }}
                            className="absolute inset-0 h-full w-full"
                        >
                            <Image
                                src={images[currentImageIndexRef.current].src}
                                width={images[currentImageIndexRef.current].width}
                                height={images[currentImageIndexRef.current].height}
                                className="absolute inset-0 h-full w-full object-cover"
                                alt="Rust game screenshot"
                                priority
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    variants={circularFadeVariants}
                    initial="hidden"
                    animate={isImageVisible ? 'visible' : 'hidden'}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-stone-900"
                ></motion.div>

                <div className="absolute inset-0 flex justify-center">
                    <div className="radial-gradient-stone-900-large h-fit w-fit rounded-b-12xl bg-stone-900 bg-opacity-15 px-4 shadow-xl sm:w-fit sm:px-16">
                        <h1 className="radial-gradient-stone-300 bg-stone-500 bg-clip-text px-4 py-4 pb-2 text-center text-2xl font-bold text-transparent sm:pb-4 sm:text-4xl">
                            {`Find Your `}
                            <span className="radial-gradient-primary_dark-large w-fit bg-primary_light bg-clip-text text-transparent">
                                Perfect
                            </span>
                            {` Wipe`}
                        </h1>
                        <div className="mt-2 flex flex-wrap justify-center space-x-2 px-8 pb-4 xs:px-4">
                            {linkData.map((link, index) => (
                                <Link key={index} href={link.href}>
                                    <button className="mb-2 rounded-md bg-gradient-to-b from-stone-300 to-stone-600 p-2 text-xs text-stone-950 hover:from-primary_light hover:to-primary_dark hover:text-stone-300 sm:text-base">
                                        {link.label}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-stone-900 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-6xl space-y-16">
                    <section>
                        <h2 className="mb-6 text-center text-3xl font-bold text-stone-200">Our Rust Servers</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Object.entries(serverData).map(([category, servers]) => (
                                <div key={category} className="flex flex-col">
                                    <h3 className="mb-4 text-center text-xl font-bold text-primary_light">{category}</h3>
                                    <div className="flex flex-1 flex-col space-y-4">
                                        {servers.map((server, index) => (
                                            <Link key={index} href={server.href}>
                                                <div className="group h-full rounded-lg bg-stone-800 p-4 transition-all hover:bg-stone-700">
                                                    <h4 className="mb-2 text-lg font-bold text-stone-200 group-hover:text-primary_light">
                                                        {server.title}
                                                    </h4>
                                                    <p className="mb-2 text-sm text-stone-400">{server.description}</p>
                                                    <p className="text-xs font-semibold text-primary">Wipes: {server.wipeSchedule}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-6 text-center text-3xl font-bold text-stone-200">Find Your Perfect Server</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {serverFinderData.map((tool, index) => (
                                <Link key={index} href={tool.href}>
                                    <div className="group flex h-full items-center rounded-lg bg-stone-800 p-6 transition-all hover:bg-stone-700">
                                        <span className="mr-4 text-2xl">{tool.icon}</span>
                                        <div>
                                            <h3 className="mb-1 text-xl font-bold text-stone-200 group-hover:text-primary_light">
                                                {tool.title}
                                            </h3>
                                            <p className="text-sm text-stone-400">{tool.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-6 text-center text-3xl font-bold text-stone-200">RustWipes Tools</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {toolsData.map((tool, index) => (
                                <Link key={index} href={tool.href}>
                                    <div className="group flex h-full items-center rounded-lg bg-stone-800 p-6 transition-all hover:bg-stone-700">
                                        <span className="mr-4 text-2xl">{tool.icon}</span>
                                        <div>
                                            <h3 className="mb-1 text-xl font-bold text-stone-200 group-hover:text-primary_light">
                                                {tool.title}
                                            </h3>
                                            <p className="text-sm text-stone-400">{tool.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
