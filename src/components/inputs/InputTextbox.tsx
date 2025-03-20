'use client';

import React, { useEffect, useRef, ReactElement } from 'react';
import { Tooltip } from 'react-tooltip';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// Utility function for class name composition
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputTextboxProps {
    idName: string;
    name: string;
    value?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    labelWidth?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: ReactElement;
    className?: string;
}

const InputTextbox: React.FC<InputTextboxProps> = ({
    idName,
    name,
    value = '',
    placeholder,
    onChange,
    labelWidth = 'md',
    icon,
    className,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = onChange !== undefined;

    // Special handling for controlled components to deal with empty values
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            // If the input is cleared, pass the empty value to parent
            // This allows for proper handling of empty/null values
            onChange(e);
        }
    };

    useEffect(() => {
        if (!isControlled && inputRef.current && value !== inputRef.current.value) {
            inputRef.current.value = value;
        }
    }, [value, isControlled]);

    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const labelWidthClasses = {
        sm: 'min-w-10 max-w-10',
        md: 'min-w-12 max-w-12',
        lg: 'min-w-14 max-w-14',
        xl: 'min-w-16 max-w-16',
    };

    return (
        <div className="m-0 flex w-full max-w-full flex-row overflow-hidden p-0">
            <div
                className={`flex h-10 ${labelWidthClasses[labelWidth]} items-center justify-center rounded-l-md bg-primary text-white`}
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                {icon}
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <input
                ref={inputRef}
                id={idName}
                name={idName}
                className={cn(
                    'flex h-10 w-full rounded-r-md border-none bg-st_dark px-3 text-sm font-medium text-st_lightest placeholder-st_light outline-none transition-all duration-150',
                    'hover:ring-1 hover:ring-inset hover:ring-primary focus:ring-2 focus:ring-inset focus:ring-primary',
                    className,
                )}
                value={isControlled ? value : undefined}
                defaultValue={!isControlled ? value : undefined}
                onChange={handleChange}
                placeholder={placeholder || ''}
                autoComplete="on"
            />
        </div>
    );
};

export default InputTextbox;
