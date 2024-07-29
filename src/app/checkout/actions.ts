'use server';

import { db, kits, pending_transactions_table } from '@/db/db';
import { eq, desc, sql } from 'drizzle-orm';

import PROJECT_CONSTANTS from '@/lib/constants';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

interface MaxIdResult {
    value: number | null;
}

export async function runStripePurchase(data: FormData) {
    const kit_id = data.get('kit_id')?.toString();
    const steam_id = data.get('steam_id')?.toString();

    if (!kit_id || !steam_id) {
        throw new Error('Kit ID and Steam ID are required');
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
    const pending_response = await create_pending_transaction(kit.id, kit.name, steam_id);

    console.log(`Pending Transaction Response (Next Line):`);
    console.log(pending_response);

    if (!pending_response) {
        console.error('No Response From Create Pending Transaction. Cannot check out...');
        return;
    }

    console.log(`Creating stripe session with kit:`, kit);

    // Create Stripe Checkout Session
    const metadata = {
        product_id: kit.id.toString(),
        steam_id: steam_id,
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
                        unit_amount: kit.price || 0 * 100, // Amount in cents
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

export async function create_pending_transaction(kit_db_id: number, kit_name: string, steam_id: string) {
    console.log(`Attempting to create pending transaction for kit_db_id: ${kit_db_id}`);
    // Fetch the current maximum ID from the PendingTransactions table
    const maxIdResult: MaxIdResult[] = await db
        .select({ value: sql`max(${pending_transactions_table.id})`.mapWith(Number) })
        .from(pending_transactions_table);

    const maxId = maxIdResult[0].value ?? 0; // If max_id is null, set it to 0

    // Calculate the next ID
    const nextId = maxId + 1;

    // Insert the new record with the next ID
    const pending_transaction_output = await db.insert(pending_transactions_table).values({
        id: nextId,
        kit_db_id,
        kit_name,
        steam_id,
    });
    return pending_transaction_output;
}

export async function verifySteamId(steamId: string) {
    // This is a placeholder function. You'll need to implement the actual Steam ID verification logic.
    // You might want to use the Steam Web API to fetch user details.
    // For now, we'll return a mock response.
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    return {
        name: 'Steam User',
        avatarUrl:
            'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    };
}
