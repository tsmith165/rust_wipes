'use client';

import React from 'react';
import CheckoutForm from './CheckoutForm';
import { motion } from 'framer-motion';
import { KitsWithExtraImages } from '@/db/schema';

interface CheckoutProps {
    current_kit: KitsWithExtraImages;
    current_id: number;
}

const Checkout: React.FC<CheckoutProps> = ({ current_kit, current_id }) => {
    console.log(`LOADING CHECKOUT PAGE - Kit ID: ${current_id}`);

    return (
        <div className="flex h-full w-full overflow-y-auto bg-stone-900 p-4">
            <div className="flex h-fit w-full flex-col items-center justify-center space-y-4 md:h-full md:flex-row md:space-x-4 md:space-y-0">
                <div className="flex h-full w-auto items-center justify-center rounded-md ">
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={current_kit.image_path}
                        alt={current_kit.name}
                        width={current_kit.width}
                        height={current_kit.height}
                        className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
                    />
                </div>
                <div className="flex h-fit w-full items-center justify-center rounded-lg text-white shadow-lg md:h-full md:w-fit md:justify-start">
                    <div className="flex w-full flex-col items-center justify-center space-y-2">
                        <h1 className="text-center text-xl font-bold text-primary">{current_kit.full_name || current_kit.name}</h1>
                        <CheckoutForm current_kit={current_kit} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
