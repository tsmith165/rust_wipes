'use server';

import { eq } from 'drizzle-orm';
import { db, kits } from '@/db/db';
import { Kits } from '@/db/schema';
import { grantKitAccess as grantKitAccessRust, revokeKitAccess as revokeKitAccessRust } from '@/utils/rust/rustServerCommands';

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

export async function getKits(): Promise<Kits[]> {
    return await db.select().from(kits).where(eq(kits.active, true)).orderBy(kits.name);
}

export async function verifySteamProfile(profileUrl: string) {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        throw new Error('Steam API key is not set');
    }

    // Extract the Steam ID from the profile URL
    const steamId = await extractSteamIdFromUrl(profileUrl);
    if (!steamId) {
        throw new Error('Invalid Steam profile URL');
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
        console.error('Error verifying Steam profile:', error);
        throw error;
    }
}

async function extractSteamIdFromUrl(url: string): Promise<string | null> {
    // Custom ID format: https://steamcommunity.com/id/[custom_id]
    const customIdMatch = url.match(/steamcommunity\.com\/id\/([^\/]+)/);
    if (customIdMatch) {
        // For custom IDs, we need to make an additional API call to get the Steam ID
        return await resolveVanityUrl(customIdMatch[1]);
    }

    // Steam ID format: https://steamcommunity.com/profiles/[steam_id]
    const steamIdMatch = url.match(/steamcommunity\.com\/profiles\/(\d+)/);
    if (steamIdMatch) {
        return steamIdMatch[1];
    }

    return null;
}

async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    if (!STEAM_API_KEY) {
        throw new Error('Steam API key is not set');
    }

    const apiUrl = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanityUrl}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.response && data.response.success === 1) {
            return data.response.steamid;
        } else {
            console.error('Failed to resolve vanity URL:', data);
            return null;
        }
    } catch (error) {
        console.error('Error resolving vanity URL:', error);
        return null;
    }
}

export async function grantKitAccess(steamId: string, kitName: string): Promise<void> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return;
    }

    try {
        await grantKitAccessRust(steamId, kitName);
        console.log(`Access granted for ${steamId} to kit ${kitName}`);
    } catch (error) {
        console.error(`Error granting access for ${steamId} to kit ${kitName}:`, error);
        throw error;
    }
}

export async function revokeKitAccess(steamId: string, kitName: string): Promise<void> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return;
    }

    try {
        await revokeKitAccessRust(steamId, kitName);
        console.log(`Access revoked for ${steamId} to kit ${kitName}`);
    } catch (error) {
        console.error(`Error revoking access for ${steamId} to kit ${kitName}:`, error);
        throw error;
    }
}
