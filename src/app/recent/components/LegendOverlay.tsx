'use client';

import React from 'react';
import { X } from 'lucide-react';
import HeatIndexKeyMap from '../HeatIndexKeyMap';

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
                    {/* Wipe Indicators */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Wipe Indicators</h3>
                        <HeatIndexKeyMap />
                        <p className="mt-3 text-sm text-st_light">
                            The colors indicate how recently the server has been wiped. Hot red indicates a very fresh wipe, while yellow
                            indicates an older wipe.
                        </p>
                    </div>

                    {/* Player Count */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Player Count</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                                <span className="text-sm text-st_lightest">Low Population (0-25%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                                <span className="text-sm text-st_lightest">Medium Population (25-50%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-st_lightest">High Population (50-75%)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-st_lightest">Close to Full/Queue (75-100%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Refresh */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Data Status</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary_light"></span>
                                    <span className="text-sm text-primary_light">Live</span>
                                </div>
                                <span className="ml-2 text-sm text-st_light">Data is fresh (less than 30 seconds old)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-cool_wipe"></span>
                                    <span className="text-sm text-cool_wipe">Stale</span>
                                </div>
                                <span className="ml-2 text-sm text-st_light">Data is older than 30 seconds</span>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-primary_light"></span>
                                    <span className="text-sm text-primary_light">Loading</span>
                                </div>
                                <span className="ml-2 text-sm text-st_light">Data is currently being refreshed</span>
                            </div>
                        </div>
                    </div>

                    {/* Server Ranks */}
                    <div className="rounded-lg bg-st_darkest p-4">
                        <h3 className="mb-3 text-lg font-medium text-st_lightest">Server Ranks</h3>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-st_lightest">Top Ranks (1-100)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-st_lightest">Good Ranks (101-500)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-st_lightest">Average Ranks (501-1000)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                                <span className="text-sm text-st_lightest">Low Ranks (1001-5000)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                                <span className="text-sm text-st_lightest">Unknown/Unranked</span>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-st_light">
                            Server ranks are based on BattleMetrics popularity. Lower numbers indicate more popular servers. Rank 1 is the
                            most popular Rust server globally.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
