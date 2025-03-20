'use client';

import { NextWipeInfo, MapOptions } from '@/db/schema';
import Image from 'next/image';

interface MapDisplayPanelProps {
    nextWipeInfo: NextWipeInfo | null;
    mapOptions: MapOptions[];
}

export function MapDisplayPanel({ nextWipeInfo, mapOptions }: MapDisplayPanelProps) {
    const currentMap = mapOptions.find((option) => option.seed === nextWipeInfo?.map_seed);

    if (!currentMap) {
        return (
            <div className="flex h-[230px] max-h-[230px] flex-col items-center justify-center bg-gradient-to-t from-stone-300 to-stone-500 bg-clip-text text-lg text-transparent">
                No map found
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col items-center justify-center">
            <b className="mb-1 h-fit bg-gradient-to-t from-stone-300 to-stone-500 bg-clip-text text-lg text-transparent">
                Current Selected Next Map
            </b>
            <a
                href={currentMap.rust_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[calc(100%-32px)] w-full items-center justify-center"
            >
                <Image
                    src={currentMap.rust_maps_image}
                    alt={currentMap.map_name}
                    className="h-full w-fit rounded-lg object-contain"
                    width={400}
                    height={300}
                    unoptimized={true}
                />
            </a>
        </div>
    );
}
