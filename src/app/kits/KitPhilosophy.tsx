import React from 'react';
import { motion } from 'framer-motion';

interface KitPhilosophyProps {
    onClose: () => void;
}

const KitPhilosophy: React.FC<KitPhilosophyProps> = ({ onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
        >
            <div className="relative w-full max-w-4xl rounded-lg bg-stone-900/95 px-4 py-6" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 text-primary_light hover:text-primary">
                    <span className="text-2xl font-bold">×</span>
                </button>
                <h2 className="mb-4 text-2xl font-bold text-primary">RustWipes.net Kit Philosophy</h2>
                <div className="space-y-4 text-stone-300">
                    <p>
                        Our kits are carefully designed to enhance your Rust experience without disrupting the game's core survival
                        mechanics. We believe in providing value while maintaining competitive balance.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-stone-800/50 p-4">
                            <h3 className="mb-2 font-semibold text-primary_light">Balanced Progression</h3>
                            <p className="text-sm">
                                Kits are structured to support your progression without skipping crucial gameplay stages or creating unfair
                                advantages.
                            </p>
                        </div>
                        <div className="rounded-lg bg-stone-800/50 p-4">
                            <h3 className="mb-2 font-semibold text-primary_light">Time-Based Access</h3>
                            <p className="text-sm">
                                Monthly kits have cooldown periods to prevent spam and maintain server economy. Single-use kits offer
                                immediate value for specific needs.
                            </p>
                        </div>
                        <div className="rounded-lg bg-stone-800/50 p-4">
                            <h3 className="mb-2 font-semibold text-primary_light">Wipe Protection</h3>
                            <p className="text-sm">
                                4-hour lockout after wipes ensures everyone starts fresh and maintains fair early-game competition.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default KitPhilosophy;
