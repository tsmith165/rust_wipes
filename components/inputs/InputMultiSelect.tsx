'use client';

import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';

interface InputMultiSelectProps {
    defaultValue?: { value: string; label: string }[];
    name: string;
    select_options: [string, string][];
    onChange?: (selectedOptions: { value: string; label: string }[]) => void;
    inputId?: string; // Added inputId prop
}

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

const InputMultiSelect: React.FC<InputMultiSelectProps> = ({ defaultValue, name, select_options, onChange, inputId }) => {
    const id = inputId;
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    return (
        <div className="m-0 flex w-full p-0">
            <div className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-secondary_dark px-2.5 py-1.5 text-secondary_light">
                <div className="text-primary">{formatted_name}</div>
            </div>
            <Select
                defaultValue={defaultValue}
                isMulti={true}
                id={id}
                name={id}
                className="h-full flex-grow rounded-r-md border-none bg-primary text-sm font-bold text-secondary_dark"
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                }}
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: '',
                        backgroundColor: '#54786d',
                    }),
                    multiValue: (styles) => ({
                        ...styles,
                        backgroundColor: '#616c63',
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        color: '#54786d',
                    }),
                }}
                options={react_select_options}
                onChange={(selectedOptions) => {
                    if (onChange) {
                        onChange(selectedOptions as { value: string; label: string }[]);
                    }
                }}
            />
        </div>
    );
};

export default InputMultiSelect;
