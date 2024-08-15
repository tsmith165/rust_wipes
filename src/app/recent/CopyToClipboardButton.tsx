'use client';

import React, { useState } from 'react';
import { MdFileCopy } from 'react-icons/md';

interface CopyToClipboardButtonProps {
    textToCopy: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 500); // Reset after 0.5s
        }
    };

    return (
        <div onClick={handleCopy} className={`cursor-pointer hover:text-red-600 ${isCopied ? 'text-green-600' : ''}`}>
            <MdFileCopy />
        </div>
    );
};

export default CopyToClipboardButton;
