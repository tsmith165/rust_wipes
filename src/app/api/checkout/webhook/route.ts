import Stripe from 'stripe';
import {
    handleCompletedCheckout,
    handleSubscriptionCancellation,
    handlePaymentFailure,
    handlePaymentCancellation,
} from '@/utils/stripe/stripeHandlers';
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

function validateMetadata(metadata: WebhookEventMetadata) {
    const requiredFields = [
        'product_id',
        'user_id',
        'steam_username',
        'email',
        'image_path',
        'image_width',
        'image_height',
        'price_id',
        'is_subscription',
    ];
    for (const field of requiredFields) {
        if (!metadata[field as keyof WebhookEventMetadata]) {
            throw new Error(`Missing required metadata: ${field}`);
        }
    }
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
        console.log('Event type:', event.type);
        console.log('Event metadata:', event.data.object.metadata);

        if (!hasMetadata(event)) {
            console.error('Event does not contain metadata:', event);
            return new Response(JSON.stringify({ error: 'Event does not contain metadata' }), { status: 400 });
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed':
                case 'payment_intent.succeeded':
                    validateMetadata(event.data.object.metadata);
                    await handleCompletedCheckout(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
                    break;
                case 'payment_intent.payment_failed':
                    await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
                    break;
                case 'payment_intent.canceled':
                    await handlePaymentCancellation(event.data.object as Stripe.PaymentIntent);
                    break;
                default:
                    console.warn(`Unhandled Stripe event type: ${event.type}`);
                    console.log('Unhandled Event Data:', event.data.object);
            }
        } catch (processingError) {
            console.error('Error processing event:', processingError);
            return new Response(JSON.stringify({ error: 'Error processing event' }), { status: 500 });
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(`Webhook Error: ${err.message}`);
            if (err.message.includes('Missing required metadata')) {
                console.error('Metadata received:', event.data.object.metadata);
            }
        } else {
            console.error('An unknown error occurred', err);
        }
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'An unknown error occurred' }), { status: 400 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}
