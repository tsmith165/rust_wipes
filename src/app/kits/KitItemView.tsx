import React from 'react';
import Image from 'next/image';
import { KitsWithExtraImages } from '@/db/schema';

interface KitItemProps {
    kit: KitsWithExtraImages & { index: number };
    handleKitClick: (id: number, index: number) => void;
    isSelected: boolean;
}

const KitItemView = ({ kit, handleKitClick, isSelected }: KitItemProps) => {
    const image_path = kit.small_image_path || kit.image_path;
    const image_width = kit.small_width || kit.width || 0;
    const image_height = kit.small_height || kit.height || 0;

    return (
        <div
            key={`kit-${kit.id}`}
            className={`group relative cursor-pointer overflow-hidden rounded-md ${isSelected ? 'bg-stone-800' : 'bg-stone-700'} shadow-lg transition duration-300 ease-in-out hover:bg-stone-800 hover:shadow-2xl`}
            onClick={() => handleKitClick(kit.id, kit.index)}
        >
            <div className="flex flex-row justify-between p-2 pb-0">
                <b
                    className={`text-lg ${isSelected ? `gradient-primary-text-opp` : `gradient-st_white-text`} group-hover:gradient-primary-text-opp`}
                >
                    {kit.full_name || kit.name}
                </b>
                <b
                    className={`text-lg ${isSelected ? `gradient-primary-text-opp` : `gradient-st_white-text`} group-hover:gradient-primary-text-opp`}
                >{`$${kit.price?.toString().includes('.') ? `${kit.price}0` : `${kit.price}.00`}`}</b>
            </div>
            <Image
                src={image_path}
                alt={kit.name}
                width={image_width}
                height={image_height}
                className="h-auto w-full rounded-lg rounded-t-lg p-1"
                priority
            />
        </div>
    );
};

export default KitItemView;
