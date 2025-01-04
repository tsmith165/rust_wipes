'use server';

import { db, rw_alerts } from '@/db/db';
import { RwAlerts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { cache } from 'react';
import { sendEmail } from '@/utils/emails/resend_utils';
import { ALERT_EMAIL_RECIPIENTS } from './Alerts.Constants';
import React from 'react';
import { render } from '@react-email/render';
import AlertEmail from '@/utils/emails/templates/AlertEmail';

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

export async function resendAlertEmail(alertId: number): Promise<void> {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return;
    }

    const alert = await db.select().from(rw_alerts).where(eq(rw_alerts.id, alertId)).limit(1);
    if (!alert[0]) {
        console.error(`Alert ${alertId} not found`);
        return;
    }

    try {
        console.log(`Resending email for alert ID: ${alertId}`);
        const alertEmailTemplate = React.createElement(AlertEmail, {
            title: alert[0].title,
            severity: alert[0].severity,
            type: alert[0].type,
            message: alert[0].message,
            server_id: alert[0].server_id,
            timestamp: alert[0].timestamp || new Date(),
        });

        const emailHtml = render(alertEmailTemplate);

        console.log('Attempting to resend email to:', ALERT_EMAIL_RECIPIENTS);
        const emailResult = await sendEmail({
            from: 'alerts@rustwipes.net',
            to: ALERT_EMAIL_RECIPIENTS,
            subject: `[${alert[0].severity.toUpperCase()}] ${alert[0].title} (Resent)`,
            html: emailHtml,
        });
        console.log('Email resend result:', emailResult);

        await db.update(rw_alerts).set({ sent: true }).where(eq(rw_alerts.id, alertId));
        console.log(`Alert ${alertId} marked as sent successfully`);

        revalidatePath('/admin/alerts');
    } catch (error) {
        console.error(`Failed to resend email for alert ${alertId}:`, error);
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        } else {
            console.error('Unknown error type:', error);
        }
        throw error;
    }
}
