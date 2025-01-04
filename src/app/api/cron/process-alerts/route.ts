import { NextResponse } from 'next/server';
import { db, rw_alerts } from '@/db/db';
import { desc, eq } from 'drizzle-orm';
import { sendEmail } from '@/utils/emails/resend_utils';
import { ALERT_EMAIL_RECIPIENTS } from '@/app/admin/alerts/Alerts.Constants';
import React from 'react';
import { render } from '@react-email/render';
import AlertEmail from '@/utils/emails/templates/AlertEmail';

// Vercel cron job handler
export async function GET() {
    try {
        console.log('Starting cron job to process unsent alerts...');
        const unsentAlerts = await db.select().from(rw_alerts).where(eq(rw_alerts.sent, false)).orderBy(desc(rw_alerts.timestamp));

        if (unsentAlerts.length === 0) {
            console.log('No unsent alerts found');
            return NextResponse.json({ message: 'No unsent alerts found' });
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
        return NextResponse.json({ message: 'Successfully processed alerts' });
    } catch (error) {
        console.error('Error in cron job:', error);
        return NextResponse.json({ error: 'Failed to process alerts' }, { status: 500 });
    }
}
