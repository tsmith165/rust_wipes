import React, { useId, ReactElement } from 'react';
import Select, { components, StylesConfig, InputProps, DropdownIndicatorProps } from 'react-select';
import { ChevronDown } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

// Utility function for class name composition
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface OptionType {
    value: string;
    label: string;
}

const DropdownIndicator = (props: DropdownIndicatorProps<OptionType, false>) => {
    return (
        <components.DropdownIndicator {...props}>
            <ChevronDown size={16} className="text-st_light" />
        </components.DropdownIndicator>
    );
};

interface InputSelectProps<T extends string> {
    defaultValue?: OptionType;
    idName: string;
    name: string;
    select_options: [T, string][];
    value?: T;
    onChange?: (value: T) => void;
    icon?: ReactElement;
    className?: string;
}

// Custom Input component that removes aria-activedescendant when empty
const Input = (props: InputProps<OptionType, false>) => {
    const newProps = {
        ...props,
        'aria-activedescendant': props['aria-activedescendant'] || undefined,
    };
    return <components.Input {...newProps} />;
};

const InputSelect = <T extends string>({
    defaultValue,
    idName,
    name,
    select_options,
    value,
    onChange,
    icon,
    className,
}: InputSelectProps<T>) => {
    const uniqueId = useId();
    const selectId = `react-select-${idName}-${uniqueId}`;

    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    const handleSelectChange = (selectedOption: OptionType | null) => {
        if (onChange && selectedOption) {
            onChange(selectedOption.value as T);
        }
    };

    // Check if the bg-st_darkest class is included
    const hasDarkestBg = className?.includes('bg-st_darkest');
    const bgColor = hasDarkestBg ? '#1c1917' : '#292524'; // st_darkest or st_dark

    const customStyles: StylesConfig<OptionType, false> = {
        control: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: bgColor,
            borderColor: 'transparent',
            boxShadow: 'none',
            height: '40px',
            '&:hover': {
                borderColor: '#991b1b', // primary
            },
        }),
        option: (baseStyles, { isFocused, isSelected }) => ({
            ...baseStyles,
            backgroundColor: isSelected
                ? '#991b1b' // primary
                : isFocused
                  ? '#292524' // st_dark
                  : '#44403c', // st
            color: isSelected ? 'white' : '#d6d3d1', // st_lightest
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#7f1d1d', // primary_dark
            },
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#44403c', // st
            zIndex: 50,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        }),
        menuList: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#44403c', // st
            padding: '4px',
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: '#d6d3d1', // st_lightest
        }),
        input: (baseStyles) => ({
            ...baseStyles,
            color: '#d6d3d1', // st_lightest
        }),
        dropdownIndicator: (baseStyles) => ({
            ...baseStyles,
            color: '#78716c', // st_light
            '&:hover': {
                color: '#d6d3d1', // st_lightest
            },
        }),
    };

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex h-10 min-w-12 max-w-12 items-center justify-center rounded-l-md bg-primary px-2.5 text-white"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                {icon}
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <Select<OptionType, false>
                inputId={selectId}
                instanceId={selectId}
                defaultValue={defaultValue}
                value={react_select_options.find((option) => option.value === value)}
                isMulti={false}
                name={idName}
                className={cn('h-full flex-grow rounded-r-md border-none bg-st_dark text-sm font-medium text-st_lightest', className)}
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                    Input,
                }}
                styles={customStyles}
                options={react_select_options}
                onChange={handleSelectChange}
            />
        </div>
    );
};

export default InputSelect;
