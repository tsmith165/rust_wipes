import { NextResponse } from 'next/server';
import { db, next_wipe_info, rw_alerts } from '@/db/db';
import { headers } from 'next/headers';
import { alertChecks } from './Alert.Checks';
import { ALERT_ID_SEVERITY, ALERT_TIME_WINDOWS, ALERT_TYPE } from '@/app/admin/alerts/Alerts.Constants';
import { and, eq, gt } from 'drizzle-orm';
import { subMinutes } from 'date-fns';

// Force dynamic route to prevent caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
    // Force headers() call to make route dynamic
    headers();

    try {
        console.log('Starting cron job to check for new alerts...', new Date().toISOString());

        // Fetch all servers from next_wipe_info
        const servers = await db.select().from(next_wipe_info);
        console.log(`Found ${servers.length} servers to check`);

        const alertsGenerated = [];

        for (const server of servers) {
            console.log(`Checking server ${server.server_name || server.server_id}`);

            for (const checkFn of alertChecks) {
                const checkResult = checkFn(server);

                if (!checkResult.shouldAlert) {
                    continue;
                }

                // Check if a similar alert was generated recently
                const timeWindow = ALERT_TIME_WINDOWS[checkResult.alertId];
                const cutoffTime = subMinutes(new Date(), timeWindow);

                const recentAlerts = await db
                    .select()
                    .from(rw_alerts)
                    .where(
                        and(
                            eq(rw_alerts.alert_id, checkResult.alertId),
                            eq(rw_alerts.server_id, checkResult.serverId),
                            gt(rw_alerts.last_occurrence, cutoffTime),
                        ),
                    )
                    .limit(1);

                if (recentAlerts.length > 0) {
                    console.log(`Skipping alert generation for ${checkResult.alertId} - similar alert exists within time window`);
                    continue;
                }

                // Generate new alert
                console.log(`Generating new alert for ${checkResult.alertId}`);
                const newAlert = await db.insert(rw_alerts).values({
                    server_id: checkResult.serverId,
                    title: checkResult.title,
                    message: checkResult.message,
                    alert_id: checkResult.alertId,
                    severity: ALERT_ID_SEVERITY[checkResult.alertId],
                    type: ALERT_TYPE.SYSTEM,
                    last_occurrence: new Date(),
                });

                alertsGenerated.push({
                    alert_id: checkResult.alertId,
                    server_id: checkResult.serverId,
                    title: checkResult.title,
                });
            }
        }

        console.log('Finished checking for new alerts');
        return new NextResponse(
            JSON.stringify({
                message: 'Successfully checked for alerts',
                timestamp: new Date().toISOString(),
                alertsGenerated,
            }),
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('Error in alert check cron job:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Failed to check for alerts',
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
