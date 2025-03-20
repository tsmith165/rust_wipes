import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const COOKIE_KEY = 'distinct_id';

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

// For server-side event capture
export async function captureEvent(event: string, properties?: Record<string, string | number | boolean>) {
    'use server';
    const cookieStore = await cookies();
    const distinctId = cookieStore.get(COOKIE_KEY)?.value || uuidv4();

    posthog.capture({
        distinctId,
        event,
        properties,
    });
}

// For getting the distinct ID on the client side
export function getClientDistinctId() {
    // Use localStorage as the primary storage
    if (typeof window !== 'undefined') {
        let distinctId = localStorage.getItem(COOKIE_KEY);
        if (!distinctId) {
            distinctId = uuidv4();
            localStorage.setItem(COOKIE_KEY, distinctId);
        }
        return distinctId;
    }
    return uuidv4(); // Fallback for SSR
}

// For server-side distinct ID access when needed
export async function getServerDistinctId() {
    'use server';
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_KEY)?.value || uuidv4();
}
