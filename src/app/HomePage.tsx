'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
    { src: '/rust_stock_game_images/rust_stock_1.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_2.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_3.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_4.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_5.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_6.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_7.webp', width: 1920, height: 1080 },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface LinkData {
    href: string;
    label: string;
}

export default function HomePage() {
    const [isImageVisible, setImageVisible] = useState(true);
    const currentImageIndexRef = useRef(0);

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
        <div className="relative h-[calc(100dvh-50px)] w-full overflow-hidden">
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
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-fit w-5/6 rounded-full bg-stone-950 bg-opacity-70 px-8 md:w-fit md:p-16">
                    <h1 className="pb-4 pt-8 text-center text-4xl text-stone-300 md:pt-4 md:text-6xl">
                        {`Find Your `}
                        <span className="w-fit bg-gradient-to-r from-primary_dark via-primary_light to-primary_dark bg-clip-text text-transparent">
                            Perfect
                        </span>
                        {` Wipe`}
                    </h1>
                    <div className="flex flex-wrap justify-center pb-8 md:pb-4">
                        {linkData.map((link, index) => (
                            <Link key={index} href={link.href}>
                                <button className="mx-2 mb-2 rounded-md bg-gradient-to-b from-stone-300 to-stone-500 p-2 text-stone-950 hover:from-primary_light hover:to-primary_dark hover:text-stone-300">
                                    {link.label}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
