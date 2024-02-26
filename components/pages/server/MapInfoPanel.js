import React from 'react';
import PropTypes from 'prop-types';

export default function MapInfoPanel({ mapData }) {
    if (!mapData) return <p>Error loading map data.</p>;

    const { seed, size, url } = mapData;

    const map_info_data = [
        { title: 'Seed', value: seed },
        { title: 'Size', value: size },
        {
            title: 'More Map Info',
            value: <a href={url} target="_blank" rel="noopener noreferrer">{`RustMaps.com/${seed}_${size}`}</a>,
        },
    ];

    return (
        <div className="rounded-lg bg-dark p-2.5 hover:bg-grey">
            <h3 className="text-xl font-bold">Map Info</h3>
            {map_info_data.map(({ title, value }) => (
                <p className="text-md hover:text-lg hover:font-bold hover:text-light" key={title}>
                    {title}: {value}
                </p>
            ))}
        </div>
    );
}

MapInfoPanel.propTypes = {
    mapData: PropTypes.object.isRequired,
};
