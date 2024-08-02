'use server';

import Stripe from 'stripe';
import { db, kits, pending_transactions_table, users, verified_transactions_table } from '@/db/db';
import { eq, desc, and } from 'drizzle-orm';
import PROJECT_CONSTANTS from '@/lib/constants';
import { grantKitAccess } from '@/utils/rust/rustServerCommands';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

// Type definitions
interface StripeResponse {
    sessionId: string;
    error?: string;
}

// Main function to create Stripe session
export async function createStripeSession(data: FormData): Promise<StripeResponse> {
    console.log('createStripeSession called');

    const kit_id = data.get('kit_id')?.toString();
    const steam_id = data.get('steam_id')?.toString();
    const steam_username = data.get('steam_username')?.toString();
    const email = data.get('email')?.toString();
    const is_subscription = data.get('is_subscription') === 'true';

    if (!kit_id || !steam_id || !steam_username || !email) {
        return { error: 'Missing required fields', sessionId: '' };
    }

    try {
        // Fetch kit data
        const kit_data = await db
            .select()
            .from(kits)
            .where(eq(kits.id, parseInt(kit_id)))
            .limit(1);
        if (!kit_data.length) {
            return { error: 'Kit not found', sessionId: '' };
        }
        const kit = kit_data[0];

        // Create pending transaction
        const pending_response = await create_pending_transaction(kit.id, kit.name, steam_id, steam_username, email, is_subscription);
        if (!pending_response) {
            return { error: 'Failed to create pending transaction', sessionId: '' };
        }

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: Number(kit.price || 5) * 100,
                        product_data: {
                            name: kit.name,
                            images: [kit.image_path],
                        },
                        recurring: is_subscription ? { interval: 'month' } : undefined,
                    },
                    quantity: 1,
                },
            ],
            mode: is_subscription ? 'subscription' : 'payment',
            success_url: `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/${kit_id}?canceled=true`,
            metadata: {
                kit_id: kit.id.toString(),
                steam_id,
                steam_username,
                email,
                is_subscription: is_subscription.toString(),
            },
        });

        console.log(`Stripe Session Created:`, session);
        console.log(`Session ID: ${session.id}`);

        return { sessionId: session.id };
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        return {
            error: error instanceof Error ? error.message : 'An unknown error occurred',
            sessionId: '',
        };
    }
}

// Function to create pending transaction
async function create_pending_transaction(
    kit_db_id: number,
    kit_name: string,
    steam_id: string,
    steam_username: string,
    email: string,
    is_subscription: boolean,
) {
    console.log(`Attempting to create pending transaction for kit_db_id: ${kit_db_id}`);

    // First, find or create the user
    let user = await db.select().from(users).where(eq(users.steam_id, steam_id)).limit(1);

    if (user.length === 0) {
        // User doesn't exist, create a new one
        const insertedUser = await db
            .insert(users)
            .values({
                steam_id,
                steam_user: steam_username,
                email,
            })
            .returning();
        user = insertedUser;
    } else {
        // Update the user's email if it has changed
        if (user[0].email !== email) {
            await db.update(users).set({ email, updated_at: new Date() }).where(eq(users.id, user[0].id));
            user[0].email = email;
        }
    }

    // Insert the new record
    const pending_transaction_output = await db.insert(pending_transactions_table).values({
        kit_db_id,
        kit_name,
        user_id: user[0].id,
        email,
        is_subscription,
    });
    return pending_transaction_output;
}

// Function to verify Steam profile
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
        console.log('Steam API response:', data);

        if (data.response && data.response.players && data.response.players.length > 0) {
            const player = data.response.players[0];
            return {
                name: player.personaname,
                avatarUrl: player.avatarfull,
                steamId: player.steamid,
            };
        } else {
            console.error('Steam user not found in API response:', data);
            throw new Error('Steam user not found');
        }
    } catch (error) {
        console.error('Error verifying Steam profile:', error);
        throw error;
    }
}

// Helper function to extract Steam ID from URL
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

// Helper function to resolve vanity URL
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

export async function redeemSingleUseKit(kitId: number, userId: number): Promise<{ success: boolean; message: string }> {
    try {
        // Check if the kit exists and is a single-use kit
        const kitData = await db.select().from(kits).where(eq(kits.id, kitId)).limit(1);
        if (kitData.length === 0) {
            return { success: false, message: 'Kit not found' };
        }
        if (kitData[0].type !== 'single') {
            return { success: false, message: 'This is not a single-use kit' };
        }

        // Check if the user has a verified transaction for this kit
        const verifiedTransaction = await db
            .select()
            .from(verified_transactions_table)
            .where(
                and(
                    eq(verified_transactions_table.kit_db_id, kitId),
                    eq(verified_transactions_table.user_id, userId),
                    eq(verified_transactions_table.redeemed, false),
                ),
            )
            .limit(1);

        if (verifiedTransaction.length === 0) {
            return { success: false, message: 'No unredeemed purchase found for this kit' };
        }

        // Fetch user data to get steam_id
        const userData = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userData.length === 0) {
            return { success: false, message: 'User not found' };
        }

        // Grant kit access in Rust servers
        const grantResult = await grantKitAccess(userData[0].steam_id, kitData[0].name);
        console.log(`Attempt to grant kit access: ${grantResult.message}`);

        if (grantResult.success) {
            // Update the redeemed status
            await db
                .update(verified_transactions_table)
                .set({ redeemed: true })
                .where(eq(verified_transactions_table.id, verifiedTransaction[0].id));

            return { success: true, message: 'Kit redeemed successfully' };
        } else {
            return { success: false, message: `Failed to grant kit access: ${grantResult.message}` };
        }
    } catch (error) {
        console.error('Error redeeming single-use kit:', error);
        return { success: false, message: 'An unexpected error occurred. Please try again later.' };
    }
}
