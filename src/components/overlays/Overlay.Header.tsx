'use client';

import React from 'react';
import { OverlayTitle } from './Overlay.Title';
import { OverlaySubtitle } from './Overlay.Subtitle';

interface OverlayHeaderProps {
    title?: string | React.ReactNode;
    subtitle?: string | React.ReactNode;
    onClose?: () => void;
}

export const OverlayHeader: React.FC<OverlayHeaderProps> = ({ title, subtitle, onClose }) => {
    if (!title && !subtitle) return null;

    return (
        <div className="flex flex-col border-b border-stone-800 p-4">
            {title && <OverlayTitle>{title}</OverlayTitle>}
            {subtitle && <OverlaySubtitle>{subtitle}</OverlaySubtitle>}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                >
                    ✕
                </button>
            )}
        </div>
    );
};
