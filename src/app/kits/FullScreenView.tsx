import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack, IoIosSpeedometer } from 'react-icons/io';
import { FaPlay, FaPause } from 'react-icons/fa';
import { KitsWithExtraImages } from '@/db/schema';

interface FullScreenViewProps {
    selectedKit: KitsWithExtraImages | null;
    currentImageIndex: number;
    setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
    imageList: { src: string; width: number; height: number }[];
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFullScreenImage: (isFullScreen: boolean) => void;
    selectedKitIndex: number | null;
    setSpeed: (speed: number) => void;
    speed: number;
}

const FullScreenView: React.FC<FullScreenViewProps> = ({
    selectedKit,
    currentImageIndex,
    setCurrentImageIndex,
    imageList,
    isPlaying,
    setIsPlaying,
    setIsFullScreenImage,
    selectedKitIndex,
    setSpeed,
    speed,
}) => {
    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    };

    const togglePlayPause = () => {
        setIsPlaying((prevState) => !prevState);
    };

    const [showSlider, setShowSlider] = useState(false);

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseInt(e.target.value, 10);
        setSpeed(newSpeed);
    };

    return (
        <AnimatePresence>
            {selectedKit && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="relative flex h-full w-full items-center justify-center">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={`${selectedKitIndex}-${currentImageIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="h-[80vh] w-[90vw]"
                                onClick={() => setIsFullScreenImage(false)}
                            >
                                <motion.img
                                    src={imageList[currentImageIndex].src}
                                    alt={selectedKit.name || ''}
                                    className="h-full w-full object-contain"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <div className="flex h-7 w-full items-center justify-center space-x-4">
                                <div className="flex w-full flex-row">
                                    <div className="flex w-full flex-grow justify-end pr-1">
                                        {imageList.length > 1 && (
                                            <button aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} className="ml-2">
                                                {isPlaying ? (
                                                    <FaPause className="fill-stone-600 text-xl hover:fill-primary" />
                                                ) : (
                                                    <FaPlay className="fill-stone-600 text-xl hover:fill-primary" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex w-fit items-center justify-center space-x-2">
                                        {imageList.length > 1 && (
                                            <button aria-label="Previous" onClick={handlePrev} className="">
                                                <IoIosArrowBack className="fill-stone-600 text-2xl hover:fill-primary" />
                                            </button>
                                        )}
                                        {imageList.map((_, index) => (
                                            <div
                                                key={`dot-${index}`}
                                                className={`h-3 w-3 rounded-full text-2xl ${
                                                    index === currentImageIndex ? ' bg-primary' : 'bg-stone-600'
                                                }`}
                                            ></div>
                                        ))}
                                        {imageList.length > 1 && (
                                            <button aria-label="Next" onClick={handleNext} className="">
                                                <IoIosArrowForward className="fill-stone-600 text-2xl hover:fill-primary" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex w-full flex-grow">
                                        <div
                                            className="group relative flex w-full flex-grow flex-row justify-start pl-1"
                                            onMouseEnter={() => setShowSlider(true)}
                                            onMouseLeave={() => setShowSlider(false)}
                                        >
                                            {imageList.length > 1 && (
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
                                                                    className="xs:w-20 w-16 cursor-pointer appearance-none rounded-lg bg-stone-600 md:w-24 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-stone-600 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
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
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenView;
