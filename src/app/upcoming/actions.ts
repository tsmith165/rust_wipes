'use server';

import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq, and, or, between, lte, isNotNull, gte, sql } from 'drizzle-orm';
import moment from 'moment-timezone';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
    is_bp_wipe: boolean;
    wipe_schedule: string;
}

interface GroupedWipeDict {
    [key: number]: ServerData[];
}

interface SearchParams {
    region?: string;
    resource_rate?: string;
    group_limit?: string;
    game_mode?: string;
    min_rank?: string;
    time_zone?: string;
    date?: string;
}

const defaultParams: Required<SearchParams> = {
    region: 'US',
    resource_rate: 'any',
    group_limit: 'any',
    game_mode: 'any',
    min_rank: '5000',
    time_zone: '-7', // Pacific Time
    date: moment().format('YYYY-MM-DD'),
};

export async function fetchFilteredServers(searchParams: SearchParams): Promise<GroupedWipeDict> {
    console.log('Starting to fetch filtered servers');

    // Merge provided search params with default params
    const mergedParams: Required<SearchParams> = { ...defaultParams, ...searchParams };

    const { region, resource_rate, group_limit, game_mode, min_rank, time_zone, date } = mergedParams;

    // Parse the selected date and time zone
    const timeZoneOffset = Number(time_zone);

    // Determine the timezone name based on the offset and whether it's currently DST
    const now = moment();
    const isDST = now.isDST();
    const timeZoneName =
        moment.tz.names().find((tz) => {
            const tzOffset = moment.tz(tz).utcOffset() / 60;
            return isDST ? tzOffset === timeZoneOffset : tzOffset === timeZoneOffset;
        }) || 'UTC';

    // The critical part: Create the date range in the user's timezone, then convert to UTC for the query

    // First, create the start and end of the selected date in the user's timezone
    const localStartOfDay = moment.tz(`${date} 00:00:00`, timeZoneName);
    const localEndOfDay = moment.tz(`${date} 23:59:59`, timeZoneName);

    // Then convert these to UTC for comparing with database values
    const utcStartOfDay = localStartOfDay.clone().utc().format('YYYY-MM-DD HH:mm:ss');
    const utcEndOfDay = localEndOfDay.clone().utc().format('YYYY-MM-DD HH:mm:ss');

    console.log(`Filtering for date: ${date} in timezone: ${timeZoneName}`);
    console.log(`Local start: ${localStartOfDay.format()}, Local end: ${localEndOfDay.format()}`);
    console.log(`UTC start: ${utcStartOfDay}, UTC end: ${utcEndOfDay}`);
    console.log(`Filters: ${region}, ${resource_rate}, ${group_limit}, ${game_mode}, Min Rank: ${min_rank}`);

    try {
        const servers = await db
            .select({
                id: rw_parsed_server.id,
                rank: rw_parsed_server.rank,
                title: rw_parsed_server.title,
                wipe_hour: sql<number>`EXTRACT(HOUR FROM ${rw_parsed_server.next_wipe})`,
                last_wipe: rw_parsed_server.last_wipe,
                next_wipe: rw_parsed_server.next_wipe,
                next_full_wipe: rw_parsed_server.next_full_wipe,
                wipe_schedule: rw_parsed_server.wipe_schedule,
            })
            .from(rw_parsed_server)
            .where(
                and(
                    eq(rw_parsed_server.region, region),
                    isNotNull(rw_parsed_server.next_wipe),
                    // Filter using the exact converted UTC timestamps
                    sql`${rw_parsed_server.next_wipe} >= ${utcStartOfDay}::timestamp`,
                    sql`${rw_parsed_server.next_wipe} <= ${utcEndOfDay}::timestamp`,
                    lte(rw_parsed_server.rank, Number(min_rank)),
                    resource_rate !== 'any' ? eq(rw_parsed_server.resource_rate, resource_rate) : undefined,
                    group_limit !== 'any' ? eq(rw_parsed_server.group_limit, group_limit) : undefined,
                    game_mode !== 'any' ? eq(rw_parsed_server.game_mode, game_mode) : undefined,
                ),
            );

        console.log(`Found ${servers.length} servers wiping on ${date} in ${timeZoneName}`);

        // Group servers by wipe hour in the user's timezone
        const grouped_wipe_dict: GroupedWipeDict = {};

        for (const server of servers) {
            if (!server.next_wipe) continue;

            // Convert the UTC wipe time to the user's timezone to get the correct hour
            const wipeTimeInUserTz = moment.utc(server.next_wipe).tz(timeZoneName);
            const hour = wipeTimeInUserTz.hour();

            // Skip servers with missing or invalid wipe_hour
            if (hour === null) continue;

            // Format dates for display
            const last_wipe = server.last_wipe ? moment.utc(server.last_wipe).tz(timeZoneName).format('MMM D') : 'TBD';

            const next_wipe = server.next_wipe ? moment.utc(server.next_wipe).tz(timeZoneName).format('MMM D') : 'TBD';

            // Determine wipe type based on several factors
            let is_full_wipe = false;
            let is_bp_wipe = false;

            // Check wipe_schedule for BP wipe indicators
            const wipeSchedule = server.wipe_schedule?.toLowerCase() || '';

            // Check if next_full_wipe is equal to next_wipe
            if (server.next_full_wipe && server.next_wipe) {
                const nextWipeDate = moment.utc(server.next_wipe);
                const nextFullWipeDate = moment.utc(server.next_full_wipe);

                // If dates are the same, it's a full wipe
                if (nextWipeDate.isSame(nextFullWipeDate, 'day')) {
                    is_full_wipe = true;
                }
                // Look for BP wipe indicators in schedule
                else if (
                    wipeSchedule.includes('bp') ||
                    wipeSchedule.includes('blueprint') ||
                    wipeSchedule.includes('no bp wipe') ||
                    wipeSchedule.includes('nobp')
                ) {
                    is_bp_wipe = true;
                }
                // Otherwise it's a normal wipe
            }

            const server_data: ServerData = {
                id: server.id,
                rank: server.rank || 0,
                title: server.title || '',
                wipe_hour: hour, // Use hour in user's timezone
                last_wipe: last_wipe,
                next_wipe: next_wipe,
                is_full_wipe: is_full_wipe,
                is_bp_wipe: is_bp_wipe,
                wipe_schedule: server.wipe_schedule || '',
            };

            if (!grouped_wipe_dict[hour]) {
                grouped_wipe_dict[hour] = [];
            }

            grouped_wipe_dict[hour].push(server_data);
        }

        // Sort servers within each hour group by rank
        Object.keys(grouped_wipe_dict).forEach((hour) => {
            grouped_wipe_dict[parseInt(hour)].sort((a, b) => a.rank - b.rank);
        });

        return grouped_wipe_dict;
    } catch (error) {
        console.error('Error fetching servers:', error);
        return {};
    }
}
