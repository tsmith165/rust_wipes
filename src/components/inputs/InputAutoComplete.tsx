'use client';

import React from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import { Tooltip } from 'react-tooltip';

interface InputAutoCompleteProps {
    idName: string;
    name: string;
    value?: string;
    onChange?: (value: string) => void;
}

const InputAutoComplete: React.FC<InputAutoCompleteProps> = ({ idName, name, value, onChange }) => {
    const formatted_name = name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="m-0 flex w-full p-0">
            <PlacesAutocomplete value={value || ''} onChange={onChange}>
                {({ getInputProps, suggestions, getSuggestionItemProps }) => {
                    const inputProps = getInputProps({
                        placeholder: 'Enter Address...',
                        className:
                            'w-full h-8 px-2.5 text-stone-950 bg-stone-400 rounded-r-md border-none pl-1.5 font-bold placeholder-stone-600',
                        autoComplete: 'rutjfkde',
                        name: idName,
                        id: idName,
                    });

                    return (
                        <div className="m-0 w-full p-0">
                            <div className="flex w-full">
                                <div
                                    className="flex h-8 min-w-28 max-w-28 items-center justify-center rounded-l-md bg-gradient-to-r from-primary_light to-primary_dark px-2.5 py-1.5"
                                    data-tooltip-id={`tooltip-${idName}`}
                                    data-tooltip-content={formatted_name}
                                >
                                    <b className="font-bold text-stone-950">{formatted_name}</b>
                                </div>
                                <Tooltip id={`tooltip-${idName}`} place="top" />
                                <input {...inputProps} />
                            </div>
                            <div className="ml-[calc(20%+5px)] w-[calc(80%-20px)]">
                                {suggestions.map((suggestion, index) => {
                                    // Use a unique index as a fallback key
                                    const uniqueKey = `suggestion-${index}-${suggestion.description.substring(0, 10)}`;

                                    // Apply suggestion props while ensuring key doesn't get overridden
                                    const itemProps = getSuggestionItemProps(suggestion);

                                    return (
                                        <div
                                            key={uniqueKey}
                                            className="h-8 bg-stone-400 px-3 text-stone-950 last:rounded-b-md hover:bg-stone-500 hover:text-stone-950"
                                            onClick={itemProps.onClick}
                                            onMouseEnter={itemProps.onMouseEnter}
                                            onMouseLeave={itemProps.onMouseLeave}
                                        >
                                            {suggestion.description}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }}
            </PlacesAutocomplete>
        </div>
    );
};

export default InputAutoComplete;
