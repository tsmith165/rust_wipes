'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserWithKits } from './actions';

interface UserWithSteamProfile extends UserWithKits {
    steamProfile: {
        name: string;
        avatarUrl: string;
        steamId: string;
    };
}

interface UsersProps {
    users: UserWithSteamProfile[];
}

export function Users({ users }: UsersProps) {
    const [expandedUser, setExpandedUser] = useState<number | null>(null);

    const toggleExpand = (userId: number) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    return (
        <div className="flex h-full w-full flex-col items-center overflow-y-auto py-4">
            <div className="w-[95%] rounded-b-lg text-lg font-bold text-stone-950 md:w-4/5">
                <div className={`flex h-fit w-full flex-col items-center rounded-b-lg rounded-t-lg bg-stone-600`}>
                    {users.map((user) => (
                        <div key={user.id} className="w-full">
                            <div
                                onClick={() => toggleExpand(user.id)}
                                className={`flex w-full cursor-pointer flex-row items-center space-x-2.5 rounded-b-lg rounded-t-lg border-b-2 border-primary_dark ${expandedUser === user.id ? 'bg-primary text-stone-950' : 'bg-stone-950 text-stone-300'} hover:bg-stone-400 hover:text-stone-950`}
                            >
                                <div className="flex h-16 w-16 items-center justify-center rounded bg-stone-600 p-1">
                                    <Image
                                        src={user.steamProfile.avatarUrl}
                                        alt={user.steam_user}
                                        width={64}
                                        height={64}
                                        className="rounded"
                                    />
                                </div>
                                <div className="flex flex-grow flex-col">
                                    <h3 className="font-bold ">{user.steamProfile.name}</h3>
                                    <p className="text-sm">Steam ID: {user.steam_id}</p>
                                </div>
                            </div>
                            {expandedUser === user.id && (
                                <div className="rounded-b-lg bg-stone-600 p-4">
                                    <h4 className="mb-2 font-bold text-stone-950">User Kits</h4>
                                    <div className="overflow-x-auto rounded-lg">
                                        <table className="w-full rounded-lg text-left text-sm text-stone-950">
                                            <thead className="bg-stone-400 text-xs uppercase text-stone-950">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3">
                                                        Kit Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Purchase Date
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Type
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {user.kits.map((kit) => (
                                                    <tr
                                                        key={kit.id}
                                                        className="rounded-b-lg border-b border-stone-400 bg-stone-950 text-stone-400 hover:bg-stone-400 hover:text-stone-950"
                                                    >
                                                        <td className="px-6 py-4">{kit.kit_name}</td>
                                                        <td className="px-6 py-4">{kit.date}</td>
                                                        <td className="px-6 py-4">{kit.is_subscription ? 'Subscription' : 'Single Use'}</td>
                                                        <td className="px-6 py-4">
                                                            {kit.is_subscription ? (
                                                                <span
                                                                    className={`font-bold ${kit.is_active ? 'text-green-800' : 'text-primary_dark'}`}
                                                                >
                                                                    {kit.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-blue-800">One-time</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
