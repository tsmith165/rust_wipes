'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OverlayBackgroundProps {
    onClose?: () => void;
}

export const OverlayBackground: React.FC<OverlayBackgroundProps> = ({ onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 z-40 bg-stone-950 bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        />
    );
};
