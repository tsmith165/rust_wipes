import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

const COOKIE_KEY = 'distinct_id';

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

export function getDistinctId(cookieStore: Awaited<ReturnType<typeof cookies>>) {
    const distinctId = cookieStore.get(COOKIE_KEY)?.value;
    return distinctId || uuidv4();
}

export async function captureEvent(event: string, properties?: Record<string, any>) {
    const cookieStore = await cookies();
    const distinctId = getDistinctId(cookieStore);
    posthog.capture({
        distinctId,
        event,
        properties,
    });
}

export async function captureDistinctId() {
    try {
        // Get the request headers to access the host
        const headersList = await headers();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

        // Construct the URL using the actual host from the request
        const apiUrl = `${protocol}://${host}/api/distinct-id`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.distinctId || uuidv4();
    } catch (error) {
        console.error('Error getting distinct ID:', error);
        // Fallback to generating a new UUID if the request fails
        return uuidv4();
    }
}
