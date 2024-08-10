import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack, IoIosSpeedometer } from 'react-icons/io';
import { FaPlay, FaPause, FaEdit, FaShieldAlt, FaCube, FaCogs, FaMedkit, FaAppleAlt } from 'react-icons/fa';
import { FaGun } from 'react-icons/fa6';
import { KitsWithExtraImages } from '@/db/schema';
import Link from 'next/link';
import { Protect } from '@clerk/nextjs';
import AdminProtect from '@/utils/auth/AdminProtect';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';

// Define the structure of the contents field
interface KitContents {
    [category: string]: {
        [item: string]: number;
    };
}

interface SelectedKitViewProps {
    selectedKit: KitsWithExtraImages;
    currentImageIndex: number;
    imageList: { src: string; width: number; height: number }[];
    smallImageList: { src: string; width: number; height: number }[];
    imageLoadStates: { [key: number]: boolean };
    handleImageLoad: () => void;
    setIsFullScreenImage: (isFullScreen: boolean) => void;
    selectedKitIndex: number | null;
    selectedImageRef: React.RefObject<HTMLDivElement>;
    handleNext: () => void;
    handlePrev: () => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
    speed: number;
    setSpeed: (speed: number) => void;
}

const SelectedKitView: React.FC<SelectedKitViewProps> = ({
    selectedKit,
    currentImageIndex,
    imageList,
    smallImageList,
    imageLoadStates,
    handleImageLoad,
    setIsFullScreenImage,
    selectedKitIndex,
    selectedImageRef,
    handleNext,
    handlePrev,
    togglePlayPause,
    isPlaying,
    speed,
    setSpeed,
}) => {
    const [showSlider, setShowSlider] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Parse the contents JSON string
    const parsedContents = useMemo(() => {
        if (typeof selectedKit.contents === 'string') {
            try {
                return JSON.parse(selectedKit.contents);
            } catch (error) {
                console.error('Error parsing contents JSON:', error);
                return null;
            }
        }
        // set selected category to the first category
        console.log(selectedKit);
        if (typeof selectedKit.contents === 'object' && selectedKit.contents !== null) {
            setSelectedCategory(Object.keys(selectedKit.contents)[0]);
            return selectedKit.contents;
        }
        return null;
    }, [selectedKit.contents]);

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseInt(e.target.value, 10);
        setSpeed(newSpeed);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategory((prev) => (prev === category ? null : category));
    };

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'guns':
                return <FaGun />;
            case 'armor':
                return <FaShieldAlt />;
            case 'farm':
                return <FaCube />;
            case 'comps':
                return <FaCogs />;
            case 'meds':
                return <FaMedkit />;
            case 'food':
                return <FaAppleAlt />;
            default:
                return null;
        }
    };

    const renderContentsButtons = () => {
        if (!parsedContents) return null;

        return (
            <div className="flex flex-wrap gap-2 overflow-y-auto">
                {Object.entries(parsedContents).map(([category, items]) => {
                    // if is not an object or the object is empty, return null
                    if (typeof items !== 'object' || items === null || Object.keys(items).length === 0) return null;

                    return (
                        <div key={category} className="">
                            <button
                                onClick={() => toggleCategory(category)}
                                className={`group flex items-center space-x-2 rounded-full bg-gradient-to-b ${category !== selectedCategory ? 'from-stone-300 to-stone-500 text-stone-950' : 'from-primary_light to-primary text-stone-300'} px-3 py-1 text-sm hover:from-primary_light hover:to-primary hover:text-stone-300`}
                            >
                                {getCategoryIcon(category)}
                                {
                                    <span
                                        className={`text-xs leading-[14px] text-stone-300 ${category !== selectedCategory ? 'hidden group-hover:!flex' : 'flex'}`}
                                    >
                                        {category}
                                    </span>
                                }
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderContents = () => {
        if (!parsedContents) return null;

        return (
            <div className="flex flex-wrap gap-2">
                {Object.entries(parsedContents).map(([category, items]) => {
                    if (category !== selectedCategory) return null;
                    return (
                        <div key={category} className="pt-2">
                            {/*
                            <b className="text-lg font-bold gradient-primary-text">
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </b>
                            */}
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(items as Record<string, number>).map(([item, amount]) => (
                                    <div
                                        key={item}
                                        className="flex items-center space-x-2 rounded-full bg-gradient-to-b from-stone-300 to-stone-500 px-3 py-1 text-sm text-stone-950 hover:from-primary_light hover:to-primary hover:text-stone-300"
                                    >
                                        <span>{item}</span>
                                        <span>{`x${amount}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <motion.div
            className={`sm: mx-auto flex h-fit w-full flex-col items-start justify-start space-y-2 p-4 sm:w-5/6 sm:flex-row sm:space-x-4 md:h-full md:max-h-[35dvh] md:min-h-[35dvh] md:space-x-4 md:space-y-0`}
            ref={selectedImageRef}
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75 }}
        >
            <div className="relative flex h-full min-h-full w-full cursor-pointer flex-col space-y-2 sm:w-1/2 md:h-full md:w-1/2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${selectedKitIndex}-${currentImageIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoadStates[currentImageIndex] ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsFullScreenImage(true)}
                        className="flex h-full w-auto items-center justify-center rounded-md"
                    >
                        {smallImageList.map((image, index) =>
                            index === currentImageIndex ? (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[index] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={`selected-${index}`}
                                    src={image.src}
                                    alt={selectedKit.name}
                                    width={image.width}
                                    height={image.height}
                                    className="max-h-[200px] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[calc(35dvh-64px)]"
                                    onLoad={handleImageLoad}
                                />
                            ) : (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[index] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={`selected-${index}`}
                                    src={image.src}
                                    alt={selectedKit.name}
                                    width={image.width}
                                    height={image.height}
                                    hidden
                                    className="max-h-[200px] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[calc(30dvh-64px)]"
                                    onLoad={handleImageLoad}
                                />
                            ),
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="flex h-7 w-full items-center justify-center space-x-4">
                    <div className="flex w-full flex-row items-center justify-center space-x-1">
                        <div className="flex flex-grow justify-end">
                            <Protect fallback={<></>}>
                                <AdminProtect fallback={<></>}>
                                    <Link href={`/admin/edit?id=${selectedKit.id}`} className="ml-2 flex items-center justify-center">
                                        <FaEdit className="h-[24px] w-[24px] fill-stone-600 p-0.5 text-xl hover:fill-primary" />
                                    </Link>
                                </AdminProtect>
                            </Protect>
                            {smallImageList.length > 1 && (
                                <button aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} className="ml-2">
                                    {isPlaying ? (
                                        <FaPause className="h-[24px] w-[24px] fill-stone-600 p-0.5 text-xl hover:fill-primary" />
                                    ) : (
                                        <FaPlay className="fill-stone-600 text-xl hover:fill-primary" />
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex w-fit items-center justify-center space-x-2">
                            {smallImageList.length > 1 && (
                                <button aria-label="Previous" onClick={handlePrev} className="">
                                    <IoIosArrowBack className="fill-stone-600 text-2xl hover:fill-primary" />
                                </button>
                            )}
                            {smallImageList.map((_, index) => (
                                <div
                                    key={`dot-${index}`}
                                    className={`h-3 w-3 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-stone-600'}`}
                                />
                            ))}
                            {smallImageList.length > 1 && (
                                <button aria-label="Next" onClick={handleNext} className="">
                                    <IoIosArrowForward className="fill-stone-600 text-2xl hover:fill-primary" />
                                </button>
                            )}
                        </div>
                        <div
                            className="group relative flex flex-grow flex-row justify-start"
                            onMouseEnter={() => setShowSlider(true)}
                            onMouseLeave={() => setShowSlider(false)}
                        >
                            {smallImageList.length > 1 && (
                                <>
                                    {showSlider ? (
                                        <div className="mr-0.5 w-6 text-center leading-6 text-primary">{speed / 1000}s</div>
                                    ) : (
                                        <IoIosSpeedometer
                                            className={`${
                                                showSlider ? 'fill-primary' : 'fill-stone-600'
                                            } relative z-10 h-[24px] w-[24px] cursor-pointer fill-stone-600 hover:fill-primary`}
                                        />
                                    )}
                                    {showSlider && (
                                        <div className="z-0 flex h-[24px] transform items-center justify-center rounded-md px-2">
                                            <div className="jutify-center flex items-center justify-center">
                                                <input
                                                    type="range"
                                                    min={2000}
                                                    max={10000}
                                                    step={100}
                                                    value={speed}
                                                    onChange={handleSpeedChange}
                                                    className="w-16 cursor-pointer appearance-none rounded-lg bg-stone-600 xs:w-20 md:w-24 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-stone-600 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="m-auto flex h-full max-h-full w-4/5 flex-col items-start justify-start sm:w-1/2 md:w-1/2 md:items-start">
                <h1 className="font-cinzel radial-gradient-primary flex bg-primary bg-clip-text text-center text-4xl font-bold text-transparent">{`${selectedKit.full_name || selectedKit.name}`}</h1>
                <div className="pt-2">
                    <StripeBrandedButton url={'/checkout/' + selectedKit.id} price={`${selectedKit.price}`} text="checkout" />
                </div>
                <p className="pt-2 text-stone-300">{selectedKit.description}</p>
                <p className={`pt-0 text-stone-300 ${selectedKit.type === 'monthly' ? '' : 'hidden'}`}>
                    Kits are locked for 4 hours after wipe, then available every 8 hours.
                </p>
                <div className={`mt-2 ${selectedKit.type === 'single' ? '' : 'hidden'}`}>
                    <div className={`font-sans text-stone-300`}>
                        <span>{`Use `}</span>
                        <span className="text-primary_light">{`/redeem`}</span>
                        <span>{` on any of our servers after purchase to redeem.`}</span>
                    </div>
                    <div className={`font-sans text-stone-300`}>{`Kits are locked and cannot be redeemed for 4 hours after wipe.`}</div>
                </div>
                {/*<p className={`pt-0 text-stone-300`}>If you have any questions, feel free to reach out on discord!</p>*/}
                <div className="w-full pt-2">{renderContentsButtons()}</div>
                <div className="w-full overflow-y-auto">{renderContents()}</div>
            </div>
        </motion.div>
    );
};

export default SelectedKitView;
