import Stripe from 'stripe';
import { eq, and } from 'drizzle-orm';
import { db, kits, pending_transactions_table, verified_transactions_table, users } from '@/db/db';
import React from 'react';
import { render } from '@react-email/render';
import { sendEmail } from '@/utils/emails/resend_utils';
import CheckoutSuccessEmail from '@/utils/emails/templates/CheckoutSuccessEmail';
import SubscriptionCanceledEmail from '@/utils/emails/templates/SubscriptionCanceledEmail';

import PROJECT_CONSTANTS from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

interface WebhookEventMetadata {
    product_id: string;
    user_id: string;
    steam_username: string;
    email: string;
    image_path: string;
    image_width: string;
    image_height: string;
    price_id: string;
    is_subscription: string;
}

function hasMetadata(event: Stripe.Event): event is Stripe.Event & { data: { object: { metadata: WebhookEventMetadata } } } {
    return 'metadata' in event.data.object;
}

export async function POST(request: Request) {
    console.log('Received Stripe Webhook Request');

    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
        if (!sig || !webhookSecret) {
            console.error('Invalid signature or webhook secret');
            return new Response(JSON.stringify({ error: 'Invalid signature or webhook secret' }), { status: 400 });
        }

        console.log('Verifying Signature From Webhook...');
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

        console.log('Stripe Event:', event);

        if ((event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') && hasMetadata(event)) {
            const stripeEvent = event.data.object;
            const metadata = stripeEvent.metadata;
            const stripeId = stripeEvent.id;
            const subscriptionId = 'subscription' in stripeEvent ? stripeEvent.subscription : null;

            console.log(`ID: ${stripeId}`);
            console.log(`Metadata:`, metadata);

            if (!metadata.product_id || !metadata.user_id || !metadata.steam_username || !metadata.email) {
                throw new Error('Missing required metadata');
            }

            const userId = parseInt(metadata.user_id, 10);
            const kitDbId = parseInt(metadata.product_id, 10);

            console.log(`Querying pending transactions for Kit DB ID: ${kitDbId} | User ID: ${userId}`);

            const pendingTransactionData = await db
                .select()
                .from(pending_transactions_table)
                .where(and(eq(pending_transactions_table.kit_db_id, kitDbId), eq(pending_transactions_table.user_id, userId)))
                .limit(1);

            console.log('Pending Transaction Data:', pendingTransactionData);

            if (pendingTransactionData.length === 0) {
                throw new Error('Pending transaction not found');
            }

            console.log('Creating Verified Transaction...');
            const createOutput = await db.insert(verified_transactions_table).values({
                kit_db_id: kitDbId,
                kit_name: pendingTransactionData[0].kit_name,
                user_id: userId,
                email: metadata.email,
                is_subscription: metadata.is_subscription === 'true',
                subscription_id: subscriptionId ? subscriptionId.toString() : null,
                image_path: metadata.image_path,
                image_width: parseInt(metadata.image_width, 10),
                image_height: parseInt(metadata.image_height, 10),
                date: new Date().toISOString().split('T')[0],
                stripe_id: stripeId,
                price: parseInt(metadata.price_id, 10),
            });
            console.log('Verified Transaction Create Output:', createOutput);

            // Fetch user data to get steam_username
            const userData = await db.select().from(users).where(eq(users.id, userId)).limit(1);

            if (userData.length === 0) {
                throw new Error('User not found');
            }

            // Send email to user and admin
            const kitData = await db.select().from(kits).where(eq(kits.id, kitDbId)).limit(1);

            if (kitData.length === 0) {
                throw new Error('Kit not found');
            }

            const checkoutSuccessEmailTemplate = React.createElement(CheckoutSuccessEmail, {
                steam_username: userData[0].steam_user,
                kit_name: kitData[0].name,
                price_paid: parseInt(metadata.price_id, 10),
                is_subscription: metadata.is_subscription === 'true',
            });
            const emailHtml = render(checkoutSuccessEmailTemplate);

            await sendEmail({
                from: 'noreply@rustwipes.net',
                to: [metadata.email, PROJECT_CONSTANTS.CONTACT_EMAIL],
                subject: `{Purchase Confirmation - ${kitData[0].name}}`,
                html: emailHtml,
            });
        } else if (event.type === 'customer.subscription.deleted') {
            // Handle subscription cancellation
            const subscription = event.data.object as Stripe.Subscription;
            const subscriptionId = subscription.id;

            // Find the verified transaction with this subscription ID
            const verifiedTransaction = await db
                .select()
                .from(verified_transactions_table)
                .where(eq(verified_transactions_table.subscription_id, subscriptionId))
                .limit(1);

            if (verifiedTransaction.length > 0) {
                // TODO: Implement logic to remove permissions from the user
                console.log(`Subscription ${subscriptionId} canceled for user ${verifiedTransaction[0].user_id}`);

                // You might want to update the user's permissions in your game server here
                // For example:
                // await removeUserPermissions(verifiedTransaction[0].user_id, verifiedTransaction[0].kit_db_id);

                // Fetch user data to get steam_username
                const userData = await db.select().from(users).where(eq(users.id, verifiedTransaction[0].user_id)).limit(1);

                if (userData.length === 0) {
                    throw new Error('User not found');
                }

                // Send an email to the user about their subscription cancellation
                const cancelEmailTemplate = React.createElement(SubscriptionCanceledEmail, {
                    steam_username: userData[0].steam_user,
                    kit_name: verifiedTransaction[0].kit_name,
                });
                const cancelEmailHtml = render(cancelEmailTemplate);

                await sendEmail({
                    from: 'noreply@rustwipes.net',
                    to: [verifiedTransaction[0].email, PROJECT_CONSTANTS.CONTACT_EMAIL],
                    subject: `Subscription Cancellation - ${verifiedTransaction[0].kit_name}`,
                    html: cancelEmailHtml,
                });
            }
        } else if (event.type === 'payment_intent.payment_failed') {
            // Handle unsuccessful payment
            console.log('Payment Unsuccessful. Handle unverified transaction (no current handling)...');
            // You might want to notify the user or update your database here
        } else if (event.type === 'payment_intent.canceled') {
            // Handle canceled payment
            console.log('Payment Canceled. Handle canceled transaction...');
            // Implement any additional logic needed for canceled payments
        } else {
            console.warn(`Unhandled Stripe event type: ${event.type}`);
            const unhandledData = event.data.object;
            console.log('Unhandled Event Data:', unhandledData);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}
