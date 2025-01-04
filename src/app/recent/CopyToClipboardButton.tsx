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
    defaultColor = 'text-stone-300',
    hoverColor = 'hover:text-red-600',
    successColor = 'text-green-600',
    hoverSuccessColor = 'hover:text-green-800',
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
