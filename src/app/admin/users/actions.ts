import { db, users, verified_transactions_table } from '@/db/db';
import { eq } from 'drizzle-orm';

import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined }> {
    const { userId } = auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated. Cannot edit kit.' };
    }
    console.log(`User ID: ${userId}`);
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    console.log(`User hasAdminRole: ${hasAdminRole}`);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role. Cannot edit kit.' };
    }
    return { isAdmin: true };
}

export interface UserWithKits {
    id: number;
    steam_id: string;
    steam_user: string;
    email: string | null;
    kits: {
        id: number;
        kit_name: string;
        date: string;
        is_subscription: boolean;
        is_active: boolean;
    }[];
}

export async function getUsers(): Promise<UserWithKits[]> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return [];
    }

    const result = await db
        .select({
            id: users.id,
            steam_id: users.steam_id,
            steam_user: users.steam_user,
            email: users.email,
            kits: verified_transactions_table,
        })
        .from(users)
        .leftJoin(verified_transactions_table, eq(users.id, verified_transactions_table.user_id));

    const userMap = new Map<number, UserWithKits>();
    const currentDate = new Date();

    result.forEach((row) => {
        if (!userMap.has(row.id)) {
            userMap.set(row.id, {
                id: row.id,
                steam_id: row.steam_id,
                steam_user: row.steam_user,
                email: row.email,
                kits: [],
            });
        }

        if (row.kits) {
            const user = userMap.get(row.id)!;
            user.kits.push({
                id: row.kits.id,
                kit_name: row.kits.kit_name,
                date: row.kits.date,
                is_subscription: row.kits.is_subscription,
                is_active: isSubscriptionActive(row.kits.date, row.kits.is_subscription),
            });
        }
    });

    return Array.from(userMap.values());
}

function isSubscriptionActive(purchaseDate: string, isSubscription: boolean): boolean {
    if (!isSubscription) return false;
    const currentDate = new Date();
    const purchaseDateTime = new Date(purchaseDate);
    const oneMonthLater = new Date(purchaseDateTime);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const isActive = currentDate <= oneMonthLater;
    return isActive;
}

export async function fetchSteamProfile(steamId: string) {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        throw new Error('Steam API key is not set');
    }

    const steamApiUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    try {
        const response = await fetch(steamApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.players && data.response.players.length > 0) {
            const player = data.response.players[0];
            return {
                name: player.personaname,
                avatarUrl: player.avatarfull,
                steamId: player.steamid,
            };
        } else {
            throw new Error('Steam user not found');
        }
    } catch (error) {
        console.error('Error fetching Steam profile:', error);
        throw error;
    }
}
