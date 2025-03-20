'use client';

import React from 'react';
import { X, Building } from 'lucide-react';
import Link from 'next/link';
import type { ServerNetwork } from '../types';

interface FilterFormOverlayProps {
    networks: ServerNetwork[];
    selectedNetworkId: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function FilterFormOverlay({ networks, selectedNetworkId, isOpen, onClose }: FilterFormOverlayProps) {
    // No need for active filters tracking here since we just show available networks

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-st_darkest/80 backdrop-blur-sm">
            <div
                className={`absolute right-0 h-full w-full max-w-md overflow-y-auto bg-st_dark p-6 shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-primary_light">Select Network</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-st_lightest transition-colors hover:bg-st_darkest hover:text-primary_light"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-2">
                    {networks.map((network) => (
                        <Link
                            key={network.id}
                            href={`/networks?networkId=${network.id}`}
                            onClick={onClose}
                            className={`group flex w-full items-center rounded-lg p-3 transition-colors ${
                                selectedNetworkId === network.id
                                    ? 'bg-primary text-st_white'
                                    : 'bg-st_darker hover:bg-st_darker/70 text-st_lightest'
                            }`}
                            prefetch={false}
                        >
                            <Building size={20} className="mr-3 flex-shrink-0" />
                            <div className="flex-grow">
                                <div className="font-medium">{network.name ?? 'Unnamed Network'}</div>
                                <div className="text-sm opacity-75">
                                    {network.servers.length} server{network.servers.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                            {selectedNetworkId === network.id && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-st_white"></div>}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
