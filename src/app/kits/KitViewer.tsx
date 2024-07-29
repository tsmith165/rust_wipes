'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import 'react-tooltip/dist/react-tooltip.css';

import { KitsWithExtraImages } from '@/db/schema';

import KitItem from './KitView';
import FullScreenView from './FullScreenView';
import SelectedKitView from './SelectedKitView';

const KitViewer: React.FC<{ kits: KitsWithExtraImages[] }> = ({ kits }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedKitIndex, setSelectedKitIndex] = useState<number | null>(null);
    const [isMasonryLoaded, setIsMasonryLoaded] = useState(false);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);

    const selectedKit = useMemo(() => (selectedKitIndex !== null ? kits[selectedKitIndex] : null), [kits, selectedKitIndex]);
    const selectedImageRef = useRef<HTMLDivElement>(null);

    const smallImageList = useMemo(() => {
        if (!selectedKit) return [];
        return [
            {
                src: selectedKit.small_image_path || selectedKit.image_path,
                width: selectedKit.small_width || selectedKit.width,
                height: selectedKit.small_height || selectedKit.height,
            },
            ...(selectedKit.extraImages || []).map((image) => ({
                src: image.small_image_path || image.image_path,
                width: image.small_width || image.width,
                height: image.small_height || image.height,
            })),
        ];
    }, [selectedKit]);

    const imageList = useMemo(() => {
        if (!selectedKit) return [];
        return [
            {
                src: selectedKit.image_path,
                width: selectedKit.width,
                height: selectedKit.height,
            },
            ...(selectedKit.extraImages || []).map((image) => ({
                src: image.image_path,
                width: image.width,
                height: image.height,
            })),
        ];
    }, [selectedKit]);

    const handleKitClick = useCallback(
        (id: number, index: number) => {
            if (selectedKitIndex === index) {
                selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            setCurrentImageIndex(0);
            setSelectedKitIndex(index);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('kit', `${id}`);
            router.replace(`/kits?${newSearchParams.toString()}`);
            setImageLoadStates({});
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        [selectedKitIndex, searchParams, router],
    );

    const kitItems = useMemo(() => {
        return kits.map((kit, index) => <KitItem key={`kit-${kit.id}`} kit={{ ...kit, index }} handleKitClick={handleKitClick} />);
    }, [kits, handleKitClick]);

    useEffect(() => {
        if (kits.length > 0) {
            setIsMasonryLoaded(true);
        }
    }, [kits]);

    useEffect(() => {
        const selectedKitId = searchParams.get('kit');
        const initialSelectedIndex = kits.findIndex((kit) => kit.id.toString() === selectedKitId);
        setSelectedKitIndex(initialSelectedIndex !== -1 ? initialSelectedIndex : null);
    }, [searchParams, kits]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && selectedKit && imageList.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
            }, speed);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [speed, isPlaying, imageList.length, selectedKit]);

    const handleImageLoad = useCallback(() => {
        setImageLoadStates((prevLoadStates) => ({
            ...prevLoadStates,
            [currentImageIndex]: true,
        }));
    }, [currentImageIndex]);

    const handleNext = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    }, [imageList.length]);

    const handlePrev = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    }, [imageList.length]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((prevState) => !prevState);
    }, []);

    if (!isMasonryLoaded)
        return (
            <div className="inset-0 flex h-full w-full items-center justify-center">
                <div className="xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px] relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70">
                    <Image src="/rust_hazmat_icon.png" alt="Rust Logo" width={186} height={186} />
                </div>
            </div>
        );

    return (
        <>
            <motion.div
                className={`radial-gradient flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-secondary_dark`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
            >
                {selectedKit && (
                    <SelectedKitView
                        selectedKit={selectedKit}
                        currentImageIndex={currentImageIndex}
                        imageList={imageList}
                        smallImageList={smallImageList}
                        imageLoadStates={imageLoadStates}
                        handleImageLoad={handleImageLoad}
                        setIsFullScreenImage={setIsFullScreenImage}
                        selectedKitIndex={selectedKitIndex}
                        selectedImageRef={selectedImageRef}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        togglePlayPause={togglePlayPause}
                        isPlaying={isPlaying}
                        speed={speed}
                        setSpeed={setSpeed}
                    />
                )}
                <motion.div
                    className={`flex h-fit w-full px-8 ${selectedKit ? 'pb-4 md:pb-8' : 'py-8'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <Masonry
                        breakpointCols={{
                            default: 5,
                            1500: 4,
                            1100: 3,
                            700: 2,
                            500: 1,
                        }}
                        className="my-masonry-grid w-full"
                        columnClassName="my-masonry-grid_column"
                    >
                        {kitItems}
                    </Masonry>
                </motion.div>
            </motion.div>
            {isFullScreenImage && selectedKit && (
                <FullScreenView
                    selectedKit={selectedKit}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    imageList={imageList}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    setIsFullScreenImage={setIsFullScreenImage}
                    selectedKitIndex={selectedKitIndex}
                    setSpeed={setSpeed}
                    speed={speed}
                />
            )}
        </>
    );
};

export default KitViewer;
