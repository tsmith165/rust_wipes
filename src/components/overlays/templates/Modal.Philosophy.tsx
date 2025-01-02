'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OverlayContainer } from '../core/Overlay.Container';

interface ModalPhilosophyProps {
    isOpen: boolean;
    onClose: () => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ModalPhilosophy: React.FC<ModalPhilosophyProps> = ({ isOpen, onClose, containerRef }) => {
    return (
        <OverlayContainer
            isOpen={isOpen}
            onClose={onClose}
            title="RustWipes.net Kit Philosophy"
            format="card"
            size="xl"
            position="none"
            animation={{
                initial: { opacity: 0, scale: 0.95 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.95 },
                transition: { duration: 0.2 },
            }}
            className="m-4 bg-stone-900/95 "
            containerRef={containerRef}
        >
            <div className="space-y-4 p-4 text-stone-300">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    Our kits are carefully designed to enhance your Rust experience without disrupting the game's core survival mechanics.
                    We believe in providing value while maintaining competitive balance.
                </motion.p>
                <motion.div
                    className="flex flex-col gap-4 sm:flex-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="w-full rounded-lg bg-stone-800/50 p-4 sm:w-1/3">
                        <h3 className="mb-2 font-semibold text-primary_light">Balanced Progression</h3>
                        <p className="text-sm">
                            Kits are structured to support your progression without skipping crucial gameplay stages or creating unfair
                            advantages.
                        </p>
                    </div>
                    <div className="w-full rounded-lg bg-stone-800/50 p-4 sm:w-1/3">
                        <h3 className="mb-2 font-semibold text-primary_light">Time-Based Access</h3>
                        <p className="text-sm">
                            Monthly kits have cooldown periods to prevent spam and maintain server economy. Single-use kits offer immediate
                            value for specific needs.
                        </p>
                    </div>
                    <div className="w-full rounded-lg bg-stone-800/50 p-4 sm:w-1/3">
                        <h3 className="mb-2 font-semibold text-primary_light">Wipe Protection</h3>
                        <p className="text-sm">
                            4-hour lockout after wipes ensures everyone starts fresh and maintains fair early-game competition.
                        </p>
                    </div>
                </motion.div>
            </div>
        </OverlayContainer>
    );
};
