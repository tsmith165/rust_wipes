'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdFileCopy } from 'react-icons/md';

export default function CopyToClipboardButton({ textToCopy }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 500); // Reset after 0.5s
        }
    };

    return (
        <div onClick={handleCopy} className={`cursor-pointer ${isCopied ? 'text-success-2' : ''}`}>
            <MdFileCopy />
        </div>
    );
}

CopyToClipboardButton.propTypes = {
    textToCopy: PropTypes.string.isRequired,
};
