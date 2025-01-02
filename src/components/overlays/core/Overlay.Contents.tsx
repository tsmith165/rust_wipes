'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OverlayContentsProps {
    children: React.ReactNode;
}

export const OverlayContents: React.FC<OverlayContentsProps> = ({ children }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 overflow-y-auto">
            {children}
        </motion.div>
    );
};
