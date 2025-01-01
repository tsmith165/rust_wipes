'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OverlaySubtitleProps {
    children: React.ReactNode;
    className?: string;
}

export const OverlaySubtitle: React.FC<OverlaySubtitleProps> = ({ children, className = '' }) => {
    return <p className={`text-sm text-stone-400 ${className}`}>{children}</p>;
};
