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
                    {/* Wipe Types */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Wipe Types</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-400">
                                    Normal Wipe
                                </div>
                                <div className="text-sm text-st_lightest">
                                    Standard map wipe, blueprints and other progression are preserved
                                </div>
                            </div>
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-orange-900/30 px-2 py-0.5 text-xs font-semibold text-cool_wipe">
                                    BP Wipe
                                </div>
                                <div className="text-sm text-st_lightest">Blueprints are wiped in addition to the map</div>
                            </div>
                            <div>
                                <div className="mb-1.5 inline-block whitespace-nowrap rounded bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-hot_wipe">
                                    Full Wipe
                                </div>
                                <div className="text-sm text-st_lightest">Everything is wiped (map, blueprints, and all progression)</div>
                            </div>
                        </div>
                    </div>

                    {/* Wipe Schedule */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Scheduled Wipes</h3>
                        <p className="text-sm text-st_light">
                            Servers are grouped by the hour they are scheduled to wipe. Times are displayed according to your selected
                            timezone. Expand each time slot to see all servers scheduled to wipe during that hour.
                        </p>
                    </div>

                    {/* Server Information */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Server Details</h3>
                        <div className="space-y-1">
                            <p className="text-sm text-st_light">
                                <span className="font-semibold text-st_lightest">Rank:</span> BattleMetrics popularity ranking
                            </p>
                            <p className="text-sm text-st_light">
                                <span className="font-semibold text-st_lightest">Last Wipe:</span> When the server most recently wiped
                            </p>
                            <p className="text-sm text-st_light">
                                <span className="font-semibold text-st_lightest">Next Wipe:</span> When the server is scheduled to wipe next
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
