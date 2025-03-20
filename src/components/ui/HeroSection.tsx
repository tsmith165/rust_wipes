'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ParticlesBackground } from './particles-background';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Info, FileCode, ChevronDown, Phone } from 'lucide-react';

// Define the available icon names we support
export type IconName = 'ArrowRight' | 'Mail' | 'Info' | 'FileCode' | 'ChevronDown' | 'Phone';

export interface HeroButtonProps {
    text: string;
    link: string;
    className?: string;
    textColor?: string;
    textHoverColor?: string;
    bgColor?: string;
    bgHoverColor?: string;
    borderColor?: string;
    isPrimary?: boolean;
    iconName?: IconName;
    iconPosition?: 'left' | 'right';
    animation?: {
        type?: 'bounce' | 'pulse' | 'slide' | 'none';
        delay?: number;
    };
}

// Simplified background types - only keeping particles for now
export type BackgroundType = 'none' | 'particles';

export interface HeroSectionProps {
    title: string;
    description: string;
    buttons: HeroButtonProps[];
    backgroundClass?: string;
    titleColorClass?: string;
    titleColorHoverClass?: string;
    descriptionColorClass?: string;
    descriptionColorHoverClass?: string;
    centered?: boolean;
    withAnimation?: boolean;
    backgroundType?: BackgroundType;
    particleColor?: string;
    particleCount?: number;
    particleConnectionOpacity?: number;
    contentBgOpacity?: number;
    glowColor?: string;
    glowSize?: string;
}

/**
 * A reusable hero section component with a particles background
 */
export default function HeroSection({
    title,
    description,
    buttons = [],
    backgroundClass = 'bg-stone-900',
    titleColorClass = 'text-primary',
    titleColorHoverClass = 'group-hover/hero-section:text-primary_light',
    descriptionColorClass = 'text-stone-300',
    descriptionColorHoverClass = 'group-hover/hero-section:text-white',
    centered = true,
    withAnimation = true,
    backgroundType = 'particles',
    particleColor = 'rgba(153, 27, 27, 1)', // Default to semi-transparent primary color
    particleCount = 80, // Default particle count
    particleConnectionOpacity = 0.15, // Default particle connection opacity
    contentBgOpacity = 0.85, // Default opacity for content background
    glowSize = '80px', // Default glow size
}: HeroSectionProps) {
    // Track animation completion state to avoid elements disappearing
    const [animationsComplete, setAnimationsComplete] = useState(false);

    // Make sure all elements are visible when the component is about to unmount
    useEffect(() => {
        return () => {
            // Force all animations to complete when component unmounts
            setAnimationsComplete(true);
        };
    }, []);

    // Function to get the icon component based on name
    const getIconComponent = (iconName: IconName) => {
        switch (iconName) {
            case 'ArrowRight':
                return ArrowRight;
            case 'Mail':
                return Mail;
            case 'Info':
                return Info;
            case 'FileCode':
                return FileCode;
            case 'ChevronDown':
                return ChevronDown;
            case 'Phone':
                return Phone;
            default:
                return ArrowRight;
        }
    };

    return (
        <section
            className={`group/hero-section relative py-16 ${backgroundClass}`}
            style={{
                minHeight: '60vh',
            }}
        >
            {/* Render the selected background */}
            {backgroundType === 'particles' && (
                <ParticlesBackground
                    particleColor={particleColor}
                    particleCount={particleCount}
                    connectionOpacity={particleConnectionOpacity}
                />
            )}

            <div
                className={`container relative z-10 mx-auto flex items-center px-4 ${centered ? 'text-center' : ''}`}
                style={{ minHeight: 'calc(60vh - 8rem)' }}
            >
                <div className={`w-full`}>
                    {/* Content container with background and glow effect */}
                    <div
                        className={`relative mx-auto max-w-4xl rounded-xl p-8 backdrop-blur-sm`}
                        style={{
                            backgroundColor: `rgba(28, 25, 23, ${contentBgOpacity})`, // stone-900 with configurable opacity
                            boxShadow: `0 0 ${glowSize} rgba(153, 27, 27, 1)`, // Using primary color directly
                            position: 'relative',
                        }}
                    >
                        {/* Subtle glow overlay */}
                        <div
                            className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                            style={{
                                background: `radial-gradient(circle at center, rgba(87, 204, 153, 0.3) 0%, rgba(87, 204, 153, 0) 70%)`,
                                zIndex: 0,
                            }}
                        ></div>

                        <motion.h1
                            key={`title`}
                            initial={withAnimation && !animationsComplete ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            onAnimationComplete={() => {
                                // Ensure title doesn't disappear after animation
                                document.getElementById('hero-title')?.style.setProperty('opacity', '1', 'important');
                            }}
                            id="hero-title"
                            style={{
                                opacity: animationsComplete ? 1 : undefined,
                            }}
                            className={`relative z-10 mb-6 text-4xl font-bold md:text-5xl ${titleColorClass} ${
                                withAnimation ? `${titleColorHoverClass} transition-colors` : ''
                            }`}
                        >
                            {title}
                        </motion.h1>

                        <motion.p
                            key={`description`}
                            initial={withAnimation && !animationsComplete ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            onAnimationComplete={() => {
                                // Ensure description doesn't disappear after animation
                                document.getElementById('hero-description')?.style.setProperty('opacity', '1', 'important');
                            }}
                            id="hero-description"
                            style={{
                                opacity: animationsComplete ? 1 : undefined,
                            }}
                            className={`relative z-10 mb-8 text-xl ${descriptionColorClass} max-w-3xl ${centered ? 'mx-auto' : ''} ${
                                withAnimation ? `${descriptionColorHoverClass} transition-colors` : ''
                            }`}
                        >
                            {description}
                        </motion.p>

                        {buttons.length > 0 && (
                            <motion.div
                                key={`buttons-container`}
                                initial={withAnimation && !animationsComplete ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                onAnimationComplete={() => {
                                    // Ensure buttons container doesn't disappear after animation
                                    document.getElementById('hero-buttons-container')?.style.setProperty('opacity', '1', 'important');
                                }}
                                id="hero-buttons-container"
                                style={{
                                    opacity: animationsComplete ? 1 : undefined,
                                }}
                                className="relative z-20 flex flex-col justify-center gap-4 sm:flex-row"
                            >
                                {buttons.map((button, index) => {
                                    // Determine if this is the primary button (first one or explicitly set)
                                    const isPrimary = button.isPrimary !== undefined ? button.isPrimary : index === 0;

                                    // Get the button styling based on the provided or default values
                                    const getButtonClasses = () => {
                                        if (button.className) return button.className;

                                        // Text color classes
                                        const textColorClass = `text-${button.textColor || (isPrimary ? 'stone-950' : 'primary')}`;
                                        const textHoverColorClass = `hover:text-${button.textHoverColor || (isPrimary ? 'stone-950' : 'white')}`;

                                        // Background color classes
                                        const bgColorClass = button.bgColor
                                            ? `${button.bgColor}`
                                            : isPrimary
                                              ? 'bg-primary'
                                              : 'bg-transparent';
                                        const bgHoverColorClass = `hover:${button.bgHoverColor || (isPrimary ? 'primary_light' : 'primary')}`;

                                        // Border color class
                                        const borderColorClass = `border-${button.borderColor || 'primary'}`;

                                        // Common classes
                                        const commonClasses =
                                            'px-5 py-2.5 rounded-lg font-medium transition-all duration-300 border flex items-center justify-center w-full relative z-10';

                                        // Primary button specific classes
                                        const primaryClasses = isPrimary
                                            ? 'shadow-md hover:shadow-lg hover:-translate-y-0.5 transform'
                                            : '';

                                        return `${textColorClass} ${textHoverColorClass} ${bgColorClass} ${bgHoverColorClass} ${borderColorClass} ${commonClasses} ${primaryClasses}`;
                                    };

                                    // Get animation classes based on the animation type
                                    const getAnimationClasses = () => {
                                        if (!button.animation || button.animation.type === 'none') return '';

                                        switch (button.animation.type) {
                                            case 'bounce':
                                                return 'animate-bounce';
                                            case 'pulse':
                                                return 'animate-pulse';
                                            case 'slide':
                                                return button.iconPosition === 'right'
                                                    ? 'transform transition-transform duration-300 group-hover:translate-x-1'
                                                    : 'transform transition-transform duration-300 group-hover:-translate-x-1';
                                            default:
                                                return '';
                                        }
                                    };

                                    // Determine which icon to use
                                    const iconName = button.iconName || (isPrimary ? 'ArrowRight' : undefined);
                                    const iconPosition = button.iconPosition || 'right';

                                    // Render the icon if iconName is provided
                                    const renderIcon = () => {
                                        if (!iconName) return null;

                                        const Icon = getIconComponent(iconName);

                                        return (
                                            <span className={`${iconPosition === 'left' ? 'mr-2' : 'ml-2'} ${getAnimationClasses()}`}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                        );
                                    };

                                    return (
                                        <motion.div
                                            key={`button-${index}`}
                                            initial={withAnimation && !animationsComplete ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.4 + index * 0.1 + (button.animation?.delay || 0),
                                                duration: 0.5,
                                            }}
                                            onAnimationComplete={() => {
                                                // Ensure button doesn't disappear after animation
                                                document
                                                    .getElementById(`hero-button-${index}`)
                                                    ?.style.setProperty('opacity', '1', 'important');
                                            }}
                                            id={`hero-button-${index}`}
                                            style={{
                                                opacity: animationsComplete ? 1 : undefined,
                                            }}
                                            className="relative z-10 w-full sm:w-auto"
                                        >
                                            {/* Use regular Link for all buttons */}
                                            <Link
                                                href={button.link}
                                                className={`group ${getButtonClasses()}`}
                                                style={{ position: 'relative', zIndex: 30 }}
                                            >
                                                {iconPosition === 'left' && renderIcon()}
                                                <span className="relative z-10">{button.text}</span>
                                                {iconPosition === 'right' && renderIcon()}

                                                {/* Hover effect overlay */}
                                                <span
                                                    className="absolute inset-0 rounded-lg bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                                                    style={{ zIndex: 5 }}
                                                ></span>

                                                {/* Glow effect */}
                                                <span
                                                    className="absolute inset-0 rounded-lg opacity-0 blur-md transition-all duration-300 group-hover:opacity-70"
                                                    style={{
                                                        zIndex: 1,
                                                        background: `radial-gradient(circle at center, rgba(87, 204, 153, 0.3) 0%, rgba(87, 204, 153, 0) 70%)`,
                                                        transform: 'scale(1.1)',
                                                    }}
                                                ></span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
