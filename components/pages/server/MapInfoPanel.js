import React from 'react';

const MapInfoPanel = ({ mapData }) => {
    if (!mapData) return <p>Error loading map data.</p>;

    const { seed, size, url } = mapData;

    const map_info_data = [
        { title: 'Seed', value: seed },
        { title: 'Size', value: size },
        {
            title: 'More Map Info',
            value: (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                >{`RustMaps.com/${seed}_${size}`}</a>
            ),
        },
    ];

    return (
        <div className="bg-dark hover:bg-grey rounded-lg p-2.5">
            <h3 className="text-xl font-bold">Map Info</h3>
            {map_info_data.map(({ title, value }) => (
                <p
                    className="text-md hover:font-bold hover:text-lg hover:text-light"
                    key={title}
                >
                    {title}: {value}
                </p>
            ))}
        </div>
    );
};

export default MapInfoPanel;
