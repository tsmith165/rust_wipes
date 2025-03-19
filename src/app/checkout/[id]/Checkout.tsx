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
        <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-stone-900 p-4">
            <div className="flex h-[calc(100dvh-50px)] w-full flex-col space-y-4 md:h-fit md:flex-row md:items-center md:justify-center md:space-x-4 md:space-y-0">
                <div className="mt-4 flex h-[40dvh] w-auto items-center justify-center rounded-md md:mt-0">
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={current_kit.image_path}
                        alt={current_kit.name}
                        width={current_kit.width}
                        height={current_kit.height}
                        className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh]"
                    />
                </div>
                <div className="flex h-fit w-full items-start justify-start rounded-lg p-2 text-st_white shadow-2xl md:h-fit md:w-fit md:justify-start">
                    <div className="flex w-full flex-col items-start justify-start space-y-2">
                        <h1
                            className={`radial-gradient-stone-300 bg-primary bg-clip-text text-center text-3xl font-bold text-transparent ${current_kit.type === 'monthly' ? '' : 'hidden'}`}
                        >
                            Purchase {current_kit.full_name || current_kit.name} Monthly Kit
                        </h1>
                        <h1
                            className={`radial-gradient-stone-300 bg-primary bg-clip-text text-center text-3xl font-bold text-transparent ${current_kit.type === 'single' ? '' : 'hidden'}`}
                        >
                            Purchase Single Use {current_kit.full_name || current_kit.name} Kit
                        </h1>
                        <h1
                            className={`radial-gradient-stone-300 bg-primary bg-clip-text text-center text-3xl font-bold text-transparent ${current_kit.type === 'priority' ? '' : 'hidden'}`}
                        >
                            Purchase {current_kit.full_name || current_kit.name} Priority
                        </h1>
                        <CheckoutForm current_kit={current_kit} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
