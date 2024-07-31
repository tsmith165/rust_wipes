'use server';

import { db, kits, pending_transactions_table, users, verified_transactions_table } from '@/db/db';
import { eq, desc, sql } from 'drizzle-orm';

import PROJECT_CONSTANTS from '@/lib/constants';
import Stripe from 'stripe';

let stripe: Stripe | null = null;

console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
if (process.env.STRIPE_SECRET_KEY) {
    console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY.length);
    console.log('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY.substring(0, 3) + '...');
}

try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        console.error('STRIPE_SECRET_KEY is not set in the environment');
        throw new Error('Stripe secret key is not configured');
    }

    console.log('Attempting to initialize Stripe...');
    stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-04-10',
    });
    console.log('Stripe initialized successfully');
} catch (error) {
    console.error('Error initializing Stripe:', error);
}

interface MaxIdResult {
    value: number | null;
}

export async function runStripePurchase(data: FormData) {
    console.log('runStripePurchase called');
    console.log('Stripe instance exists:', !!stripe);

    if (!stripe) {
        console.error('Stripe is not initialized in runStripePurchase');
        throw new Error('Stripe is not initialized');
    }

    const kit_id = data.get('kit_id')?.toString();
    const steam_id = data.get('steam_id')?.toString();
    const steam_username = data.get('steam_username')?.toString();

    if (!kit_id || !steam_id || !steam_username) {
        throw new Error('Kit ID, Steam ID, and Steam Username are required');
    }

    const kit_data = await db
        .select()
        .from(kits)
        .where(eq(kits.id, parseInt(kit_id)))
        .orderBy(desc(kits.o_id))
        .limit(1);

    if (!kit_data.length) {
        throw new Error('Kit not found');
    }
    const kit = kit_data[0];

    console.log('Creating a Pending Transaction ...');
    const pending_response = await create_pending_transaction(kit.id, kit.name, steam_id, steam_username);

    console.log(`Pending Transaction Response (Next Line):`);
    console.log(pending_response);

    if (!pending_response) {
        console.error('No Response From Create Pending Transaction. Cannot check out...');
        return;
    }

    // Get the user ID from the pending transaction
    const user = await db.select().from(users).where(eq(users.steam_id, steam_id)).limit(1);
    if (user.length === 0) {
        throw new Error('User not found');
    }
    const userId = user[0].id;

    console.log(`Creating stripe session with kit:`, kit);

    // Create Stripe Checkout Session
    const metadata = {
        product_id: kit.id.toString(),
        user_id: userId.toString(),
        steam_id: steam_id,
        steam_username: steam_username,
        image_path: kit.image_path,
        image_width: kit.width.toString(),
        image_height: kit.height.toString(),
        price_id: kit.price?.toString() || '',
    };

    console.log(`Creating a Stripe Checkout Session with metadata:`, metadata);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: Number(kit.price || 5) * 100, // Amount in cents
                        product_data: {
                            name: kit.name,
                            images: [kit.image_path],
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/success/${kit.id}`,
            cancel_url: `https://${PROJECT_CONSTANTS.SITE_URL}/checkout/${kit.id}`,
            client_reference_id: kit.id.toString(),
            payment_intent_data: {
                metadata: metadata, // Include metadata in the payment intent
            },
        });

        console.log(`Stripe Session Created:`, session);
        console.log(`Session ID: ${session.id}`);

        return {
            success: true,
            redirectUrl: session.url,
        };
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        throw error;
    }
}

export async function create_pending_transaction(kit_db_id: number, kit_name: string, steam_id: string, steam_username: string) {
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
            })
            .returning();
        user = insertedUser;
    }

    // Insert the new record
    const pending_transaction_output = await db.insert(pending_transactions_table).values({
        kit_db_id,
        kit_name,
        user_id: user[0].id,
    });
    return pending_transaction_output;
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
