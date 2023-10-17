import React, { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CachedIcon from '@material-ui/icons/Cached';

import { twMerge as tw } from 'tailwind-merge';

const INPUT_TYPE_MASTER = {
    input: { name: 'Input' },
    input_and_refresh: { name: 'Input and Button' },
    input_datepicker: { name: 'Input Datepicker' },
    input_select: { name: 'Input Select' },
};

const InputComponent = ({
    type,
    default: defaultValue,
    name,
    full_name = name,
    select_options = [],
    button_function,
    update_filter_value,
    state,
}) => {
    const [value, setValue] = useState(defaultValue);
    const id = name.toLowerCase().replace(' ', '_');

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        update_filter_value(id, newValue);
    };

    const handleDateChange = (date) => {
        setValue(date);
        update_filter_value(id, date);
    };

    switch (type) {
        case 'input':
            return (
                <div className={'flex w-full'}>
                    {/* Adjust tailwind classes as per design requirements */}
                    <Tooltip title={full_name} placement="top-start">
                        <div className="flex items-center justify-center p-1.5 bg-secondary rounded-l-md whitespace-nowrap">
                            <div className="text-dark font-bold text-lg">{name}</div>
                        </div>
                    </Tooltip>
                    <input
                        id={id}
                        className="w-full text-secondary bg-medium rounded-r-md font-bold text-sm border-none p-1.5"
                        value={value}
                        onChange={handleChange}
                    />
                </div>
            );
        case 'input_and_refresh':
            return (
                <div className="flex flex-row w-full ">
                    <Tooltip title={full_name} placement="top-start">
                        <div className="flex items-center justify-center p-1.5 bg-secondary rounded-l-md">
                            <div className="text-dark font-bold text-lg whitespace-nowrap">
                                {name}
                            </div>
                        </div>
                    </Tooltip>
                    <input
                        id={id}
                        className="px-1.5 text-secondary bg-medium rounded-r-md font-bold text-sm border-none"
                        value={value}
                        onChange={handleChange}
                    />
                    <div
                        className={`p-1.5 rounded-md cursor-pointer ${
                            state.running ? 'bg-green-500' : 'bg-medium'
                        } `}
                        onClick={(e) => {
                            e.preventDefault();
                            button_function();
                        }}>
                        <CachedIcon className={`${state.refreshing ? 'animate-spin' : ''} `} />
                    </div>
                </div>
            );

        case 'input_datepicker':
            return (
                <div className="flex flex-row w-full">
                    {/* Adjust tailwind classes as per design requirements */}
                    <Tooltip title={full_name} placement="top-start">
                        <div className="flex items-center justify-center p-1.5 bg-secondary rounded-l-md whitespace-nowrap">
                            <div className="text-dark font-bold text-lg">{name}</div>
                        </div>
                    </Tooltip>
                    <DatePicker
                        id={id}
                        className="p-2.5 text-secondary bg-medium rounded-r-md font-bold text-sm border-none"
                        selected={value}
                        onChange={handleDateChange}
                        autoComplete="off"
                    />
                </div>
            );

        case 'input_select':
            return (
                <div className="flex w-full">
                    {/* Adjust tailwind classes as per design requirements */}
                    <div className="flex items-center justify-center p-1.5  bg-secondary rounded-l-md whitespace-nowrap">
                        <div className="text-dark font-bold text-lg">{name}</div>
                    </div>
                    <select
                        id={id}
                        className="w-full p-1.5  text-secondary bg-medium rounded-r-md font-bold text-sm border-none"
                        value={value}
                        onChange={handleChange}>
                        {select_options.map(([option_value, option_string], i) => (
                            <option value={option_value} key={i}>
                                {option_string}
                            </option>
                        ))}
                    </select>
                </div>
            );

        default:
            throw new Error(`Unsupported type: ${type}`);
    }
};

export default InputComponent;
