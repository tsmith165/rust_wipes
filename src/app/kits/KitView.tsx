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
            className="group relative cursor-pointer overflow-hidden rounded-md bg-stone-700 shadow-lg transition duration-300 ease-in-out hover:bg-stone-800 hover:shadow-2xl"
            onClick={() => handleKitClick(kit.id, kit.index)}
        >
            <Image
                src={image_path}
                alt={kit.name}
                width={image_width}
                height={image_height}
                className="h-auto w-full rounded-lg object-cover p-1"
                priority
            />
            {/* 
            <div className="absolute inset-0 flex items-center justify-center p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-center text-xl font-bold text-white">{kit.name}</p>
            </div>
            */}
            <div className="flex flex-row justify-between p-2">
                <b className="gradient-white-text group-hover:gradient-primary-text-opp text-lg">{kit.name}</b>
                <span className="text-md text-stone-400 group-hover:text-primary">{`$${kit.price}.00`}</span>
            </div>
        </div>
    );
};

export default KitItem;
