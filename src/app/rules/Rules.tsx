'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, AlertTriangle, MessageCircle, Clock, Zap } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import rulesData from '@/lib/rules_data';

// Animation variants
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

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
    'General Rules': <Shield className="text-primary_light" size={20} />,
    'Building Rules': <AlertTriangle className="text-primary_light" size={20} />,
    'Raiding & PvP Rules': <Zap className="text-primary_light" size={20} />,
    'Chat & Communication': <MessageCircle className="text-primary_light" size={20} />,
    'Wipe Day Rules': <Clock className="text-primary_light" size={20} />,
};

export default function Rules() {
    // Track which category is currently open (if any)
    const [openCategory, setOpenCategory] = useState<number | null>(null);

    // Function to toggle a category open/closed
    const toggleCategory = (categoryIndex: number) => {
        setOpenCategory(openCategory === categoryIndex ? null : categoryIndex);
    };

    return (
        <div className="radial-gradient-stone-600 h-full overflow-y-auto bg-stone-950 pb-16">
            <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 p-6 pt-8">
                <motion.h1
                    className="bg-gradient-to-r from-primary_light to-amber-300 bg-clip-text text-center text-4xl font-bold text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Server Rules
                </motion.h1>

                <motion.p
                    className="max-w-2xl text-center text-lg font-light text-stone-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    These rules are designed to ensure a fair and enjoyable experience for all players. Failure to comply may result in
                    warnings, kicks, or bans at the discretion of server administrators.
                </motion.p>

                <motion.div className="w-full space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                    {rulesData.map((category, categoryIndex) => (
                        <RuleCategory
                            key={categoryIndex}
                            category={category.category}
                            rules={category.rules}
                            index={categoryIndex}
                            icon={categoryIcons[category.category] || <Shield className="text-primary_light" size={20} />}
                            isOpen={openCategory === categoryIndex}
                            onToggle={() => toggleCategory(categoryIndex)}
                        />
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 rounded-lg border border-stone-700/30 bg-stone-800/20 p-6 text-center"
                >
                    <p className="mb-3 text-stone-300">If you have any questions about these rules, please join our Discord community:</p>
                    <a
                        href="https://discord.gg/rustwipes"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary_light px-4 py-2 font-medium text-st_white transition-transform hover:scale-105"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaDiscord className="h-5 w-5" />
                        Join our Discord
                    </a>
                </motion.div>
            </div>
        </div>
    );
}

function RuleCategory({
    category,
    rules,
    index,
    icon,
    isOpen,
    onToggle,
}: {
    category: string;
    rules: { title: string; description: string }[];
    index: number;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.div variants={itemVariants} className="overflow-hidden rounded-lg border border-stone-700/30 bg-stone-800/20 shadow-lg">
            <div
                className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-stone-800/80 to-stone-800/50 p-4"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-xl font-semibold text-primary_light">{category}</h2>
                </div>
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={20} className="text-primary_light" />
                </motion.div>
            </div>

            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="divide-y divide-stone-700/20"
                >
                    {rules.map((rule, ruleIndex) => (
                        <RuleItem key={ruleIndex} title={rule.title} description={rule.description} index={ruleIndex} />
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}

function RuleItem({ title, description, index }: { title: string; description: string; index: number }) {
    return (
        <motion.div
            className="p-5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
        >
            <h3 className="mb-2 text-lg font-semibold text-primary_light/90">{title}</h3>
            <p className="text-stone-300">{description}</p>
        </motion.div>
    );
}
