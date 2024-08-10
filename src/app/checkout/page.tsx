import { redirect } from 'next/navigation';
import { db, kits } from '@/db/db';
import { eq, desc } from 'drizzle-orm';

export default async function CheckoutRedirectPage() {
    // Fetch the most recent active kit
    const mostRecentKit = await db.select({ id: kits.id }).from(kits).where(eq(kits.active, true)).orderBy(desc(kits.o_id)).limit(1);

    if (mostRecentKit.length === 0) {
        // Handle the case where no active kits are found
        throw new Error('No active kits found');
    }

    // Redirect to the checkout page for the most recent kit
    redirect(`/checkout/${mostRecentKit[0].id}`);
}

export const dynamic = 'force-dynamic';
