'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'react-tooltip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HiRefresh } from 'react-icons/hi';

export default function InputComponent({
    type,
    defaultValue,
    param_name,
    param_full_name,
    select_options = [],
    button_function,
    searchParams,
}) {
    const [value, setValue] = useState(defaultValue);
    const id = param_name.toLowerCase().replace(' ', '_');

    const running = true;
    const refreshing = false;

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        change_route_on_value_change(param_name, newValue);
    };

    const handleDateChange = (date) => {
        setValue(date);
        change_route_on_value_change(param_name, date);
    };

    const change_route_on_value_change = (param_name, value) => {
        window.location.href = `/recent?page=${searchParams.page}&${param_name}=${value}`;
    };

    return (
        <div className={'flex w-full'}>
            {/* Tooltip trigger */}
            <div data-tip data-for={id} className="flex items-center justify-center whitespace-nowrap rounded-l-md bg-primary p-1">
                <div className="text-md text-secondary_dark font-bold">{param_full_name}</div>
            </div>
            {/* Actual tooltip */}
            <Tooltip id={id} place="top" effect="solid">
                {`${param_full_name}`}
            </Tooltip>

            {type === 'input' && (
                <input
                    id={id}
                    name={param_name}
                    className="text-md w-full rounded-r-md border-none bg-secondary p-1 font-bold text-primary"
                    value={value || defaultValue}
                    onChange={handleChange}
                />
            )}
            {type === 'input_and_refresh' && (
                <>
                    <input
                        id={`${id}-input`}
                        name={param_name}
                        className="text-md rounded-r-md border-none bg-secondary px-1 font-bold text-primary"
                        value={value || defaultValue}
                        onChange={handleChange}
                    />
                    <div
                        className={`cursor-pointer rounded-md p-0.5 ${running ? 'bg-green-500' : 'bg-secondary'} `}
                        onClick={(e) => {
                            e.preventDefault();
                            button_function();
                        }}
                    >
                        <HiRefresh className={`${refreshing ? 'animate-spin' : ''} `} />
                    </div>
                </>
            )}
            {type === 'input_datepicker' && (
                <DatePicker
                    id={id}
                    name={param_name}
                    className="text-md w-full rounded-r-md border-none bg-secondary p-1 font-bold text-primary"
                    selected={value}
                    onChange={handleDateChange}
                    autoComplete="off"
                    style={{ width: '100% !important' }}
                />
            )}
            {type === 'input_select' && (
                <div className="flex w-full">
                    <select
                        id={id || defaultValue}
                        name={param_name}
                        className="text-md w-full rounded-r-md border-none bg-secondary p-1 font-bold text-primary"
                        value={value}
                        onChange={handleChange}
                    >
                        {select_options.map(([option_value, option_string], i) => (
                            <option value={option_value} key={i}>
                                {option_string}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}

InputComponent.propTypes = {
    type: PropTypes.string.isRequired,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
    param_name: PropTypes.string.isRequired,
    param_full_name: PropTypes.string,
    select_options: PropTypes.array,
    button_function: PropTypes.func,
    searchParams: PropTypes.object,
};
