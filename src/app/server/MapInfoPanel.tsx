import React from 'react';
import Image from 'next/image';

interface MapData {
    seed: string;
    size: string;
    url: string;
    thumbnailUrl: string;
}

interface MapInfoPanelProps {
    mapData: MapData;
    name: string;
}

export default function MapInfoPanel({ mapData, name }: MapInfoPanelProps) {
    if (!mapData || !mapData.thumbnailUrl) return null;

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
        <div className="rounded-lg bg-stone-800">
            <Image className="w-full rounded-lg p-2" src={mapData.thumbnailUrl} alt={`Thumbnail of ${name}`} width={200} height={200} />

            <div className=" px-2.5 pb-2.5">
                {map_info_data.map(({ title, value }) => (
                    <div className="m-0 flex flex-row space-x-1.5 p-0" key={title}>
                        <b className="text-primary_light">{`${title}: `}</b>
                        <p className="text-secondary_light hover:font-bold hover:text-primary_light">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
