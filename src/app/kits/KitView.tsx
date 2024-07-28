import React from 'react';
import Image from 'next/image';
import { KitsWithExtraImages } from '@/db/schema';

interface KitItemProps {
    kit: KitsWithExtraImages & { index: number };
    handleKitClick: (id: number, index: number) => void;
}

const KitItem = ({ kit, handleKitClick }: KitItemProps) => {
    const image_path = kit.small_image_path || kit.image_path;
    let image_width = kit.small_width || kit.width || 0;
    let image_height = kit.small_height || kit.height || 0;

    return (
        <div
            key={`kit-${kit.id}`}
            className="group relative cursor-pointer overflow-hidden rounded-md bg-stone-600 shadow-md transition duration-300 ease-in-out hover:shadow-lg"
            onClick={() => handleKitClick(kit.id, kit.index)}
        >
            <Image
                src={image_path}
                alt={kit.name}
                width={image_width}
                height={image_height}
                className="h-auto w-full rounded-md bg-stone-600 object-cover p-1"
                priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-center text-xl font-bold text-white">{kit.name}</p>
            </div>
        </div>
    );
};

export default KitItem;
