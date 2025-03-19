import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MenuOverlayButtonProps {
    menu_name: string;
    id: string;
    url_endpoint: string;
    isActive: boolean;
    isLastItem?: boolean;
    icon?: React.ElementType;
    description?: string;
    group?: string;
    compact?: boolean;
}

function MenuOverlayButton({
    menu_name,
    id,
    url_endpoint,
    isActive,
    isLastItem,
    icon: Icon,
    description,
    compact = false,
}: MenuOverlayButtonProps) {
    return (
        <Link
            href={url_endpoint}
            className={`group relative flex w-full items-center gap-2 overflow-hidden border-b border-stone-700/20 transition-all duration-200 hover:bg-stone-800/60 ${
                isActive ? 'bg-stone-800/90 text-primary_light' : 'bg-stone-900/70 text-stone-300 hover:text-primary_light/90'
            } ${isLastItem ? 'rounded-b-lg' : ''} ${compact ? 'py-1.5' : 'py-2'}`}
            id={`${id}`}
            aria-label={menu_name}
            prefetch={false}
        >
            {/* Highlight indicator for active item */}
            {isActive && (
                <motion.div
                    layoutId={`active-indicator-${compact ? 'compact' : 'full'}`}
                    className="absolute left-0 top-0 h-full w-1 bg-primary_light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            )}

            <div className={`flex w-full items-center ${compact ? 'px-2' : 'p-3'}`}>
                {/* Icon container */}
                <div
                    className={`flex items-center justify-center rounded-md ${
                        isActive ? 'bg-primary/20 text-primary_light' : 'bg-stone-800/50 text-stone-400 group-hover:text-primary_light/80'
                    } transition-colors duration-200 ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
                >
                    {Icon && <Icon size={compact ? 14 : 18} className="transition-transform duration-200 group-hover:scale-110" />}
                </div>

                {/* Text content */}
                <div className={`ml-2 flex flex-col ${compact ? 'max-w-[85%]' : ''}`}>
                    <span className={`truncate text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{menu_name}</span>

                    {description && !compact && (
                        <span className="mt-0.5 text-xs text-stone-400 group-hover:text-stone-300">{description}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default MenuOverlayButton;
