import React from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

export default function MapInfoPanel({ mapData, name }) {
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
        <div className="rounded-lg bg-dark">
            <div className="rounded-t-lg p-2.5 text-light">
                <h3 className="text-xl font-bold ">Map Info</h3>
            </div>
            <div className="bg-grey px-2.5 pb-2.5">
                {map_info_data.map(({ title, value }) => (
                    <div className="m-0 flex flex-row space-x-1.5 p-0" key={title}>
                        <b className="text-primary">{`${title}: `}</b>
                        <p className="text-dark hover:font-bold hover:text-light">{value}</p>
                    </div>
                ))}
            </div>
            <Image className="w-full rounded-b-lg" src={mapData.thumbnailUrl} alt={`Thumbnail of ${name}`} width={100} height={100} />
        </div>
    );
}

MapInfoPanel.propTypes = {
    mapData: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
};
