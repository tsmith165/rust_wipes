'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Kits } from '@/db/schema';
import { verifySteamProfile, grantKitAccess, revokeKitAccess } from './actions';
import { FaSteam } from 'react-icons/fa';

interface TestsProps {
    kits: Kits[];
    activeTab: string;
}

interface ActionResult {
    success: boolean;
    message: string;
    serverResults: { serverName: string; response: string; success: boolean; command: string }[];
}

export function Tests({ kits, activeTab }: TestsProps) {
    const [steamProfileUrl, setSteamProfileUrl] = useState('');
    const [steamProfile, setSteamProfile] = useState<{ name: string; avatarUrl: string; steamId: string } | null>(null);
    const [steamError, setSteamError] = useState<string | null>(null);
    const [selectedKitId, setSelectedKitId] = useState<number | ''>('');
    const [actionResult, setActionResult] = useState<ActionResult | null>(null);

    const handleSteamProfileVerification = async () => {
        setSteamError(null);
        if (steamProfileUrl.length > 0) {
            try {
                const profile = await verifySteamProfile(steamProfileUrl);
                setSteamProfile(profile);
            } catch (error) {
                console.error('Error verifying Steam profile:', error);
                setSteamProfile(null);
                setSteamError('Failed to verify Steam profile. Please check the URL and try again.');
            }
        } else {
            setSteamProfile(null);
        }
    };

    const handleGrantAccess = async () => {
        if (!steamProfile || selectedKitId === '') return;
        try {
            const result = await grantKitAccess(steamProfile.steamId, selectedKitId);
            setActionResult(result);
        } catch (error) {
            setActionResult({
                success: false,
                message: `Error granting access: ${error instanceof Error ? error.message : String(error)}`,
                serverResults: [],
            });
        }
    };

    const handleRevokeAccess = async () => {
        if (!steamProfile || selectedKitId === '') return;
        try {
            const result = await revokeKitAccess(steamProfile.steamId, selectedKitId);
            setActionResult(result);
        } catch (error) {
            setActionResult({
                success: false,
                message: `Error revoking access: ${error instanceof Error ? error.message : String(error)}`,
                serverResults: [],
            });
        }
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-stone-700 text-lg font-bold text-st_darkest md:w-4/5">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-st_darkest">
                    <div className="flex pt-1">
                        <Link
                            href="/admin/test?tab=kit-access"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'kit-access'
                                    ? 'bg-st_darkest text-primary'
                                    : 'bg-primary text-st_darkest hover:bg-st_darkest hover:text-primary'
                            }`}
                        >
                            Kit Access
                        </Link>
                        {/* Add more tabs here as needed */}
                    </div>
                </div>

                <div className="flex h-fit w-full flex-col items-center p-2 sm:p-4">
                    <div className="w-full space-y-2 sm:w-4/5 sm:space-y-4">
                        <div className="">
                            <select
                                id="kit_select"
                                className="w-full rounded-md border-none bg-stone-400 px-2 py-1 text-sm font-bold text-stone-950"
                                value={selectedKitId}
                                onChange={(e) => setSelectedKitId(Number(e.target.value))}
                            >
                                <option value="">Select a kit</option>
                                {kits.map((kit) => (
                                    <option key={kit.id} value={kit.id}>
                                        {`(${kit.id}) ${kit.name} - ${kit.type}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="">
                            <div className="flex">
                                <input
                                    type="text"
                                    id="steam_profile_url"
                                    className="flex-grow rounded-l-md border-none bg-stone-400 px-2 py-1 text-sm font-bold text-stone-950 placeholder-stone-950"
                                    placeholder="Enter Steam Profile URL"
                                    value={steamProfileUrl}
                                    onChange={(e) => setSteamProfileUrl(e.target.value)}
                                />
                                <button
                                    onClick={handleSteamProfileVerification}
                                    className="flex flex-row items-center justify-center rounded-r-md bg-blue-500 px-2 py-1 text-sm text-st_white hover:bg-blue-600"
                                >
                                    <FaSteam className="mr-1.5 flex h-[16px] w-[16px] " />
                                    Verify
                                </button>
                            </div>
                        </div>
                        {steamProfile && (
                            <div className="mb-4 flex items-center space-x-2">
                                <img src={steamProfile.avatarUrl} alt="Steam Avatar" className="h-8 w-8 rounded-full" />
                                <p className="text-sm">
                                    <span className="font-semibold text-green-500">Verified: </span>
                                    <span className="text-stone-300">
                                        {steamProfile.name} ({steamProfile.steamId})
                                    </span>
                                </p>
                            </div>
                        )}
                        {steamError && <div className="mb-4 text-sm text-red-500">{steamError}</div>}
                        <div className="flex flex-row space-x-4">
                            <button
                                onClick={handleGrantAccess}
                                className="rounded bg-green-800 px-4 py-2 font-bold text-st_white hover:bg-green-700 hover:text-stone-950 disabled:opacity-50"
                                disabled={!steamProfile || selectedKitId === ''}
                            >
                                Grant Access
                            </button>
                            <button
                                onClick={handleRevokeAccess}
                                className="rounded bg-red-800 px-4 py-2 font-bold text-st_white hover:bg-red-700 hover:text-stone-950 disabled:opacity-50"
                                disabled={!steamProfile || selectedKitId === ''}
                            >
                                Revoke Access
                            </button>
                        </div>
                        {actionResult && (
                            <div className="mt-4">
                                {/* Global Result 
                                <h3 className="mb-2 text-lg font-bold">Result:</h3>
                                <div className={`mb-2 rounded p-2 ${actionResult.success ? 'bg-green-700' : 'bg-red-700'}`}>
                                    <p className="text-sm font-bold">{actionResult.message}</p>
                                </div>
                                */}
                                {actionResult.serverResults && (
                                    <div className="mt-2">
                                        <h4 className="text-md mb-1 font-bold">Server Details:</h4>
                                        {actionResult.serverResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className={`mb-2 rounded p-2 ${result.success ? 'bg-green-600' : 'bg-red-600'}`}
                                            >
                                                <p className="text-sm font-bold">{result.serverName}:</p>
                                                <p className="mb-1 font-mono text-sm">Command: {result.command}</p>
                                                {typeof result.response === 'string' ? (
                                                    <p className="text-sm">
                                                        Response: {JSON.parse(result.response).content || 'Command executed successfully'}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
