'use client';

import React, { useState } from 'react';
import { MdFileCopy } from 'react-icons/md';

interface CopyToClipboardButtonProps {
    textToCopy: string;
    defaultColor?: string;
    hoverColor?: string;
    successColor?: string;
    hoverSuccessColor?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
    textToCopy,
    defaultColor = 'text-st_lightest',
    hoverColor = 'hover:text-primary_light',
    successColor = 'text-hot_wipe',
    hoverSuccessColor = 'hover:text-primary_light',
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 500);
        }
    };

    return (
        <div
            onClick={handleCopy}
            className={`cursor-pointer transition-colors ${isCopied ? `${successColor} ${hoverSuccessColor}` : `${defaultColor} ${hoverColor}`}`}
        >
            <MdFileCopy />
        </div>
    );
};

export default CopyToClipboardButton;
