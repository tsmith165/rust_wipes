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

interface ServerResponse {
    content: string;
    Identifier: number;
    Type: string;
    Stacktrace: string;
}

export function Tests({ kits, activeTab }: TestsProps) {
    const [steamProfileUrl, setSteamProfileUrl] = useState('');
    const [steamProfile, setSteamProfile] = useState<{ name: string; avatarUrl: string; steamId: string } | null>(null);
    const [steamError, setSteamError] = useState<string | null>(null);
    const [selectedKit, setSelectedKit] = useState<string>('');
    const [actionResults, setActionResults] = useState<{ serverName: string; response: ServerResponse | string }[] | null>(null);

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
        if (!steamProfile || !selectedKit) return;
        try {
            const results = await grantKitAccess(steamProfile.steamId, selectedKit);
            setActionResults(
                results.map((result) => ({
                    ...result,
                    response: tryParseJSON(result.response) || result.response,
                })),
            );
        } catch (error) {
            setActionResults([
                { serverName: 'Error', response: `Error granting access: ${error instanceof Error ? error.message : String(error)}` },
            ]);
        }
    };

    const handleRevokeAccess = async () => {
        if (!steamProfile || !selectedKit) return;
        try {
            const results = await revokeKitAccess(steamProfile.steamId, selectedKit);
            setActionResults(
                results.map((result) => ({
                    ...result,
                    response: tryParseJSON(result.response) || result.response,
                })),
            );
        } catch (error) {
            setActionResults([
                { serverName: 'Error', response: `Error revoking access: ${error instanceof Error ? error.message : String(error)}` },
            ]);
        }
    };

    const tryParseJSON = (jsonString: string): ServerResponse | null => {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return null;
        }
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-lg bg-stone-700 text-lg font-bold text-secondary_dark md:w-4/5">
                <div className="w-full rounded-t-md bg-primary_dark text-lg font-bold text-secondary_dark">
                    <div className="flex pt-1">
                        <Link
                            href="/admin/test?tab=kit-access"
                            className={`rounded-t-md px-2 py-1 ${
                                activeTab === 'kit-access'
                                    ? 'bg-secondary_dark text-primary'
                                    : 'bg-primary text-secondary_dark hover:bg-secondary_dark hover:text-primary'
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
                                value={selectedKit}
                                onChange={(e) => setSelectedKit(e.target.value)}
                            >
                                <option value="">Select a kit</option>
                                {kits.map((kit) => (
                                    <option key={kit.id} value={kit.name}>
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
                                    className="flex flex-row items-center justify-center rounded-r-md bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
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

                        <div className="flex justify-between">
                            <button
                                onClick={handleGrantAccess}
                                className="rounded bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800 disabled:opacity-50"
                                disabled={!steamProfile || !selectedKit}
                            >
                                Grant Access
                            </button>
                            <button
                                onClick={handleRevokeAccess}
                                className="rounded bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800 disabled:opacity-50"
                                disabled={!steamProfile || !selectedKit}
                            >
                                Revoke Access
                            </button>
                        </div>

                        {actionResults && (
                            <div className="mt-4">
                                <h3 className="mb-2 text-lg font-bold">Results:</h3>
                                {actionResults.map((result, index) => (
                                    <div key={index} className="mb-2 rounded bg-stone-700 p-2">
                                        <p className="font-bold">{result.serverName}:</p>
                                        {typeof result.response === 'string' ? (
                                            <p className="text-sm">{result.response}</p>
                                        ) : (
                                            <div>
                                                <p className="text-sm">{result.response.content}</p>
                                                {result.response.Stacktrace !== '' && (
                                                    <p className="text-sm">Stacktrace: {result.response.Stacktrace}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
