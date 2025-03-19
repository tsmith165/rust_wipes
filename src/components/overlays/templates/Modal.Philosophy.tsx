'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Zap, ExternalLink } from 'lucide-react';
import { OverlayContainer } from '../core/Overlay.Container';

interface ModalPhilosophyProps {
    isOpen: boolean;
    onClose: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

// Animation variants for staggered children animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const ModalPhilosophy: React.FC<ModalPhilosophyProps> = ({ isOpen, onClose, containerRef }) => {
    return (
        <OverlayContainer
            isOpen={isOpen}
            onClose={onClose}
            title="RustWipes.net Kit Philosophy"
            format="card"
            size="xl"
            position="center"
            animation={{
                initial: { opacity: 0, scale: 0.95, y: 10 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95, y: 10 },
                transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 30 },
            }}
            className="border border-stone-700/30 bg-gradient-to-b from-stone-900/95 to-stone-950/95 shadow-xl backdrop-blur-md"
            containerRef={containerRef}
            showBackdrop={true}
            backdropBlur={true}
            useFlexPositioning={true}
        >
            <div className="space-y-6 p-6 text-stone-300">
                <motion.p
                    className="text-lg font-light leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Our kits are carefully designed to enhance your Rust experience without disrupting the game's core survival mechanics.
                    We believe in providing value while maintaining competitive balance.
                </motion.p>

                <motion.div className="mb-2 mt-4" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="mb-2">
                        <h2 className="flex items-center text-xl font-medium text-primary_light">
                            <Zap className="mr-2 h-5 w-5 text-amber-400" strokeWidth={2} />
                            Core Principles
                        </h2>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-lg border border-stone-700/30 bg-stone-800/50 p-5 transition-colors duration-300 hover:bg-stone-800/70"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <Shield className="absolute right-3 top-3 h-12 w-12 text-primary_light/10" strokeWidth={1.5} />
                        <h3 className="mb-3 flex items-center font-semibold text-primary_light">
                            <Shield className="mr-2 h-5 w-5 text-primary_light" strokeWidth={2} />
                            Balanced Progression
                        </h3>
                        <p className="relative z-10 text-sm leading-relaxed">
                            Kits are structured to support your progression without skipping crucial gameplay stages or creating unfair
                            advantages.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-lg border border-stone-700/30 bg-stone-800/50 p-5 transition-colors duration-300 hover:bg-stone-800/70"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <Clock className="absolute right-3 top-3 h-12 w-12 text-primary_light/10" strokeWidth={1.5} />
                        <h3 className="mb-3 flex items-center font-semibold text-primary_light">
                            <Clock className="mr-2 h-5 w-5 text-primary_light" strokeWidth={2} />
                            Time-Based Access
                        </h3>
                        <p className="relative z-10 text-sm leading-relaxed">
                            Kits have cooldown periods to prevent spam and maintain server economy. Single-use kits offer immediate value
                            for specific needs.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-lg border border-stone-700/30 bg-stone-800/50 p-5 transition-colors duration-300 hover:bg-stone-800/70"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <Zap className="absolute right-3 top-3 h-12 w-12 text-primary_light/10" strokeWidth={1.5} />
                        <h3 className="mb-3 flex items-center font-semibold text-primary_light">
                            <Zap className="mr-2 h-5 w-5 text-primary_light" strokeWidth={2} />
                            Wipe Protection
                        </h3>
                        <p className="relative z-10 text-sm leading-relaxed">
                            4-hour lockout after wipes ensures everyone starts fresh and maintains fair early-game competition.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 border-t border-stone-700/30 pt-4 text-center"
                >
                    <a href="/rules" className="inline-flex items-center text-sm text-primary_light hover:underline">
                        Learn more about our server rules
                        <ExternalLink className="ml-1 h-3 w-3" strokeWidth={2} />
                    </a>
                </motion.div>
            </div>
        </OverlayContainer>
    );
};
