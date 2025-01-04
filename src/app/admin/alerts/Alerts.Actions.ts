'use server';

import { db, rw_alerts } from '@/db/db';
import { RwAlerts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { cache } from 'react';

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated.' };
    }
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role.' };
    }
    return { isAdmin: true };
}

export const getAlerts = cache(async (): Promise<RwAlerts[]> => {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return [];
    }

    return await db.select().from(rw_alerts).orderBy(desc(rw_alerts.timestamp)).limit(20);
});

export async function archiveAlert(alertId: number): Promise<void> {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return;
    }

    const { userId } = await auth();
    if (!userId) return;

    await db
        .update(rw_alerts)
        .set({
            active: false,
            archived_at: new Date(),
            archived_by: userId,
        })
        .where(eq(rw_alerts.id, alertId));

    revalidatePath('/admin/alerts');
}

export async function restoreAlert(alertId: number): Promise<void> {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return;
    }

    await db
        .update(rw_alerts)
        .set({
            active: true,
            archived_at: null,
            archived_by: null,
        })
        .where(eq(rw_alerts.id, alertId));

    revalidatePath('/admin/alerts');
}
