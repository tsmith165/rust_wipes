'use client';

import React from 'react';
import Select, { components, StylesConfig, DropdownIndicatorProps } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// Utility function for class name composition
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputMultiSelectProps {
    defaultValue?: { value: string; label: string }[];
    name: string;
    select_options: [string, string][];
    onChange?: (selectedOptions: { value: string; label: string }[]) => void;
    inputId?: string;
    className?: string;
}

interface OptionType {
    value: string;
    label: string;
}

const DropdownIndicator = (props: DropdownIndicatorProps<OptionType, true>) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-st_darkest" />
        </components.DropdownIndicator>
    );
};

const InputMultiSelect: React.FC<InputMultiSelectProps> = ({ defaultValue, name, select_options, onChange, inputId, className }) => {
    const id = inputId;
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    const customStyles: StylesConfig<OptionType, true> = {
        control: (baseStyles) => ({
            ...baseStyles,
            borderColor: '',
            backgroundColor: '#54786d',
        }),
        multiValue: (styles) => ({
            ...styles,
            backgroundColor: '#616c63',
        }),
        option: (provided) => ({
            ...provided,
            color: '#54786d',
        }),
    };

    const handleChange = (selectedOptions: readonly OptionType[] | null) => {
        if (onChange && selectedOptions) {
            onChange(selectedOptions as { value: string; label: string }[]);
        }
    };

    return (
        <div className="m-0 flex w-full p-0">
            <div className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-st_darkest px-2.5 py-1.5 text-st_lightest">
                <div className="text-primary">{formatted_name}</div>
            </div>
            <Select<OptionType, true>
                defaultValue={defaultValue}
                isMulti={true}
                id={id}
                name={id}
                className={cn('h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold text-st_darkest', className)}
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                }}
                styles={customStyles}
                options={react_select_options}
                onChange={handleChange}
            />
        </div>
    );
};

export default InputMultiSelect;
