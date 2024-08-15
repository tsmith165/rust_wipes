'use client';

import React from 'react';
import Select, { components } from 'react-select';
import { FaArrowDown } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const DropdownIndicator = (props: any) => {
    return (
        <components.DropdownIndicator {...props}>
            <FaArrowDown className="fill-secondary_dark" />
        </components.DropdownIndicator>
    );
};

interface InputSelectProps {
    defaultValue?: { value: string; label: string };
    idName: string;
    name: string;
    select_options: [string, string][];
    value?: string;
    onChange?: (value: string) => void;
}

const InputSelect: React.FC<InputSelectProps> = ({ defaultValue, idName, name, select_options, value, onChange }) => {
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const react_select_options = select_options.map((option) => ({ value: option[0], label: option[1] }));

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex min-w-28 max-w-28 items-center justify-center rounded-l-md bg-gradient-to-r from-primary_light to-primary_dark px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                <div className="font-bold text-stone-950">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <Select
                defaultValue={defaultValue}
                value={react_select_options.find((option) => option.value === value)}
                isMulti={false}
                id={idName}
                name={idName}
                className="h-full flex-grow rounded-r-md border-none bg-stone-400 text-sm font-bold text-stone-950"
                classNamePrefix="select"
                components={{
                    DropdownIndicator,
                }}
                styles={{
                    control: (baseStyles) => ({
                        ...baseStyles,
                        borderColor: '',
                        backgroundColor: 'var(--tw-bg-stone-400)',
                    }),
                }}
                options={react_select_options}
                onChange={(selectedOption) => onChange && onChange(selectedOption?.value || '')}
            />
        </div>
    );
};

export default InputSelect;
