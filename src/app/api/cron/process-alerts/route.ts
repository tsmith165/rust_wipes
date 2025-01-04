import { NextResponse } from 'next/server';
import { db, rw_alerts } from '@/db/db';
import { desc, eq } from 'drizzle-orm';
import { sendEmail } from '@/utils/emails/resend_utils';
import { ALERT_EMAIL_RECIPIENTS } from '@/app/admin/alerts/Alerts.Constants';
import React from 'react';
import { render } from '@react-email/render';
import AlertEmail from '@/utils/emails/templates/AlertEmail';
import { headers } from 'next/headers';

// Force dynamic route to prevent caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Vercel cron job handler
export async function GET() {
    // Force headers() call to make route dynamic
    headers();

    try {
        console.log('Starting cron job to process unsent alerts...', new Date().toISOString());
        const unsentAlerts = await db.select().from(rw_alerts).where(eq(rw_alerts.sent, false)).orderBy(desc(rw_alerts.timestamp));

        if (unsentAlerts.length === 0) {
            console.log('No unsent alerts found');
            return new NextResponse(JSON.stringify({ message: 'No unsent alerts found', timestamp: new Date().toISOString() }), {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            });
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
        return new NextResponse(
            JSON.stringify({
                message: 'Successfully processed alerts',
                timestamp: new Date().toISOString(),
                processedCount: unsentAlerts.length,
            }),
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('Error in cron job:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to process alerts',
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
