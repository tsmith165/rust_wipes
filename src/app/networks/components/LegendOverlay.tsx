'use client';

import React from 'react';
import { X } from 'lucide-react';

interface LegendOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LegendOverlay({ isOpen, onClose }: LegendOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-st_darkest/80 backdrop-blur-sm">
            <div
                className={`absolute right-0 h-full w-full max-w-md overflow-y-auto bg-st_dark p-6 shadow-lg transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-primary_light">Legend</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-st_lightest transition-colors hover:bg-st_darkest hover:text-primary_light"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Resource Rates */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Resource Rates</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-st_dark px-2 py-0.5 text-xs font-semibold text-st_lightest">
                                    Vanilla
                                </div>
                                <div className="text-sm text-st_lightest">Standard resource gathering rates, no multipliers</div>
                            </div>
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-st_dark px-2 py-0.5 text-xs font-semibold text-st_lightest">
                                    1.5x - 2x
                                </div>
                                <div className="text-sm text-st_lightest">Slightly increased resource gathering rates</div>
                            </div>
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-st_dark px-2 py-0.5 text-xs font-semibold text-st_lightest">
                                    3x - 5x+
                                </div>
                                <div className="text-sm text-st_lightest">Significantly increased resource gathering rates</div>
                            </div>
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-st_dark px-2 py-0.5 text-xs font-semibold text-st_lightest">
                                    Build / Creative
                                </div>
                                <div className="text-sm text-st_lightest">Servers focused on building with unlimited resources</div>
                            </div>
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-st_dark px-2 py-0.5 text-xs font-semibold text-st_lightest">
                                    Arena / AimTrain
                                </div>
                                <div className="text-sm text-st_lightest">Servers focused on combat practice, PVP, and aim training</div>
                            </div>
                        </div>
                    </div>

                    {/* Server Details */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Server Details</h3>
                        <div className="space-y-1">
                            <p className="text-sm text-st_light">
                                <span className="font-semibold text-st_lightest">Pop:</span> Current/maximum player count
                            </p>
                            <p className="text-sm text-st_light">
                                <span className="font-semibold text-st_lightest">Since Wipe:</span> Time elapsed since the server last wiped
                            </p>
                            <p className="text-sm text-st_light">
                                <span className="font-semibold text-st_lightest">Until Wipe:</span> Time remaining until the server&apos;s
                                next scheduled wipe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
