'use server';

import { db, rw_alerts } from '@/db/db';
import { RwAlerts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { sendEmail } from '@/utils/emails/resend_utils';
import { ALERT_EMAIL_RECIPIENTS } from './Alerts.Constants';
import React from 'react';
import { render } from '@react-email/render';
import AlertEmail from '@/utils/emails/templates/AlertEmail';
import { unstable_cache } from 'next/cache';

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

export const getAlerts = unstable_cache(
    async (): Promise<RwAlerts[]> => {
        const { isAdmin, error } = await checkUserRole();
        if (!isAdmin) {
            console.error(error);
            return [];
        }

        // Process any unsent alerts before returning
        await processUnsentAlerts();

        return await db.select().from(rw_alerts).orderBy(desc(rw_alerts.timestamp)).limit(20);
    },
    ['alerts-list'],
    {
        revalidate: 60, // Revalidate every 60 seconds
        tags: ['alerts'], // Tag for manual revalidation
    },
);

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
    revalidateTag('alerts'); // Revalidate the cache
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
    revalidateTag('alerts'); // Revalidate the cache
}

async function processUnsentAlerts(): Promise<void> {
    console.log('Starting to process unsent alerts...');
    const unsentAlerts = await db.select().from(rw_alerts).where(eq(rw_alerts.sent, false)).orderBy(desc(rw_alerts.timestamp));

    if (unsentAlerts.length === 0) {
        console.log('No unsent alerts found');
        return;
    }

    console.log(`Found ${unsentAlerts.length} unsent alerts`);

    for (const alert of unsentAlerts) {
        try {
            // Double check the alert hasn't been sent by another process
            const currentAlert = await db.select().from(rw_alerts).where(eq(rw_alerts.id, alert.id)).limit(1);

            if (currentAlert[0]?.sent) {
                console.log(`Alert ${alert.id} was already sent, skipping`);
                continue;
            }

            console.log(`Processing alert ID: ${alert.id}`);
            console.log(
                `Alert details: ${JSON.stringify(
                    {
                        title: alert.title,
                        severity: alert.severity,
                        type: alert.type,
                        server_id: alert.server_id,
                    },
                    null,
                    2,
                )}`,
            );

            const alertEmailTemplate = React.createElement(AlertEmail, {
                title: alert.title,
                severity: alert.severity,
                type: alert.type,
                message: alert.message,
                server_id: alert.server_id,
                timestamp: alert.timestamp || new Date(),
            });

            const emailHtml = render(alertEmailTemplate);

            console.log('Attempting to send email to:', ALERT_EMAIL_RECIPIENTS);
            const emailResult = await sendEmail({
                from: 'alerts@rustwipes.net',
                to: ALERT_EMAIL_RECIPIENTS,
                subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
                html: emailHtml,
            });
            console.log('Email send result:', emailResult);

            console.log(`Marking alert ${alert.id} as sent`);
            await db.update(rw_alerts).set({ sent: true }).where(eq(rw_alerts.id, alert.id));
            console.log(`Alert ${alert.id} marked as sent successfully`);
        } catch (error) {
            console.error(`Failed to process alert ${alert.id}:`, error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                });
            } else {
                console.error('Unknown error type:', error);
            }
        }
    }
    console.log('Finished processing unsent alerts');
}
