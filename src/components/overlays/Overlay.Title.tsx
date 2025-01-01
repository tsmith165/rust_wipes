'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OverlayTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const OverlayTitle: React.FC<OverlayTitleProps> = ({ children, className = '' }) => {
    return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
};
