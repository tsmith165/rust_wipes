'use client';

import React from 'react';
import { Calendar, Clock, Info } from 'lucide-react';

export default function InfoCardsSection() {
    return (
        <section className="bg-st_dark py-16">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-primary_light">About Upcoming Wipes</h2>
                    <p className="mx-auto max-w-3xl text-st_lightest">
                        Plan your Rust gameplay with precision using our upcoming wipe schedule tracker. Get accurate information for
                        servers across different time zones.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-lg bg-st p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary_dark text-primary_light">
                            <Calendar size={24} />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-st_white">Scheduled Wipes</h3>
                        <p className="text-st_lightest">
                            View all upcoming scheduled wipes in an easy-to-read format. Filter by your preferences to find the perfect
                            server.
                        </p>
                    </div>

                    <div className="rounded-lg bg-st p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary_dark text-primary_light">
                            <Clock size={24} />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-st_white">Time Zone Support</h3>
                        <p className="text-st_lightest">
                            Our schedule automatically adjusts to your selected time zone, so you&apos;ll never miss a wipe no matter where
                            you are in the world.
                        </p>
                    </div>

                    <div className="rounded-lg bg-st p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary_dark text-primary_light">
                            <Info size={24} />
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-st_white">Detailed Information</h3>
                        <p className="text-st_lightest">
                            Get comprehensive details about each server including rank, last wipe date, and whether it&apos;s a full wipe or
                            BP wipe.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
