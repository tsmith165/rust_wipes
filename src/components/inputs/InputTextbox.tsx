'use client';

import React, { useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';

interface InputTextboxProps {
    idName: string;
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    labelWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const InputTextbox: React.FC<InputTextboxProps> = ({
    idName,
    name,
    value,
    placeholder,
    onChange,
    labelWidth = 'md', // Default to medium width, which matches the original size
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const prevValueRef = useRef<string | undefined>(value);

    useEffect(() => {
        if (value !== prevValueRef.current) {
            prevValueRef.current = value;
            if (inputRef.current && !onChange) {
                inputRef.current.value = value || '';
            }
        }
    }, [idName, value, onChange]);

    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Define width classes based on the labelWidth prop
    const labelWidthClasses = {
        sm: 'min-w-24 max-w-24',
        md: 'min-w-28 max-w-28',
        lg: 'min-w-36 max-w-36',
        xl: 'min-w-44 max-w-44',
    };

    return (
        <div className="m-0 flex w-full max-w-full flex-row overflow-hidden p-0">
            <div
                className={`flex h-8 ${labelWidthClasses[labelWidth]} items-center justify-center rounded-l-md bg-gradient-to-r from-primary_light to-primary_dark px-2.5 py-1.5`}
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                <div className="truncate font-bold text-stone-950">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <input
                ref={inputRef}
                id={idName}
                name={idName}
                className="flex h-8 w-full rounded-r-md border-none bg-stone-400 px-2 text-sm font-bold text-stone-950 placeholder-stone-700"
                value={onChange ? value : undefined}
                defaultValue={!onChange ? value : undefined}
                placeholder={placeholder || ''}
                onChange={onChange}
                autoComplete="on"
            />
        </div>
    );
};

export default InputTextbox;
