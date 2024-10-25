import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

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

export async function captureDistictId() {
    const hostname = process.env.NODE_ENV === 'production' ? 'https://www.rustwipes.net' : 'http://localhost:3000';
    const apiUrl = `${hostname}/api/distinct-id`;
    const response = await fetch(apiUrl);

    let distinctId = '';
    try {
        const data = await response.json();
        distinctId = data.distinctId || '';
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
    return distinctId;
}
