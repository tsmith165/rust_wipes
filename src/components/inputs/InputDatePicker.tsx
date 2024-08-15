'use client';

import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import DatePicker from 'react-datepicker';
import moment from 'moment-timezone';
import 'react-datepicker/dist/react-datepicker.css';

interface InputDatePickerProps {
    idName: string;
    name: string;
    defaultValue?: string;
    onChange?: (date: Date) => void;
}

const InputDatePicker: React.FC<InputDatePickerProps> = ({ idName, name, defaultValue, onChange }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        if (defaultValue) {
            const parsedDate = moment(defaultValue, 'YYYY-MM-DD', true);
            if (parsedDate.isValid()) {
                setSelectedDate(parsedDate.toDate());
            } else {
                setSelectedDate(new Date());
            }
        } else {
            setSelectedDate(new Date());
        }
    }, [defaultValue]);

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        if (date && onChange) {
            onChange(date);
        }
    };

    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex w-full p-0">
            <div
                className="flex h-8 min-w-28 max-w-28 items-center justify-center rounded-l-md bg-gradient-to-r from-primary_light to-primary_dark px-2.5 py-1.5"
                data-tooltip-id={`tooltip-${idName}`}
                data-tooltip-content={formatted_name}
            >
                <div className="font-bold text-stone-950">{formatted_name}</div>
            </div>
            <Tooltip id={`tooltip-${idName}`} place="top" />
            <DatePicker
                id={idName}
                name={idName}
                className="h-8 rounded-r-md border-none bg-stone-400 px-2.5 text-sm font-bold text-stone-950 placeholder-stone-600"
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
            />
        </div>
    );
};

export default InputDatePicker;
