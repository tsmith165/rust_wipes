'use server';

import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq, and, or, between, lte } from 'drizzle-orm';
import moment from 'moment-timezone';

interface ServerData {
    id: number;
    rank: number;
    title: string;
    wipe_hour: number;
    last_wipe: string;
    next_wipe: string;
    is_full_wipe: boolean;
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

    // Create a moment object in the selected timezone
    const selectedDate = moment.tz(date, timeZoneName).startOf('day');

    // Calculate the start and end of the day in UTC
    const startOfDay = selectedDate.clone().utc();
    const endOfDay = startOfDay.clone().add(1, 'day');

    console.log(`Filtering servers for UTC date range: ${startOfDay.format()} to ${endOfDay.format()}`);
    console.log(`Filters: ${region}, ${resource_rate}, ${group_limit}, ${game_mode}, Min Rank: ${min_rank}, Time Zone: ${timeZoneName}`);

    const query = db
        .select()
        .from(rw_parsed_server)
        .where(
            and(
                eq(rw_parsed_server.region, region),
                or(
                    between(rw_parsed_server.next_wipe, startOfDay.toDate(), endOfDay.toDate()),
                    between(rw_parsed_server.next_full_wipe, startOfDay.toDate(), endOfDay.toDate()),
                ),
                lte(rw_parsed_server.rank, Number(min_rank)),
                resource_rate !== 'any' ? eq(rw_parsed_server.resource_rate, resource_rate) : undefined,
                group_limit !== 'any' ? eq(rw_parsed_server.group_limit, group_limit) : undefined,
                game_mode !== 'any' ? eq(rw_parsed_server.game_mode, game_mode) : undefined,
            ),
        );

    console.log('Query:', query.toSQL());

    const servers = await query;

    const grouped_wipe_dict: GroupedWipeDict = {};
    servers.forEach((server) => {
        const fullWipeDate = server.next_full_wipe ? moment.utc(server.next_full_wipe) : null;
        const regularWipeDate = server.next_wipe ? moment.utc(server.next_wipe) : null;

        let wipeDate: moment.Moment | null = null;
        let isFullWipe = false;

        if (fullWipeDate && regularWipeDate) {
            wipeDate = fullWipeDate.isBefore(regularWipeDate) ? fullWipeDate : regularWipeDate;
            isFullWipe = fullWipeDate.isSameOrBefore(regularWipeDate);
        } else {
            wipeDate = fullWipeDate || regularWipeDate;
            isFullWipe = !!fullWipeDate;
        }

        if (wipeDate) {
            // Convert wipe time to the selected time zone, considering DST
            const localWipeDate = wipeDate.clone().tz(timeZoneName);
            const wipe_hour = localWipeDate.hour();

            const last_wipe = server.last_wipe ? moment.utc(server.last_wipe).tz(timeZoneName).format('M/D h:mmA') : 'N/A';
            const next_wipe = localWipeDate.format('M/D h:mmA');

            const server_data: ServerData = {
                id: server.id,
                rank: server.rank || 0,
                title: server.title || '',
                wipe_hour: wipe_hour,
                last_wipe: last_wipe,
                next_wipe: next_wipe,
                is_full_wipe: isFullWipe,
            };

            if (grouped_wipe_dict[wipe_hour] === undefined) {
                grouped_wipe_dict[wipe_hour] = [server_data];
            } else {
                grouped_wipe_dict[wipe_hour].push(server_data);
            }
        }
    });

    // Sort servers within each hour group by rank
    Object.keys(grouped_wipe_dict).forEach((hour) => {
        grouped_wipe_dict[parseInt(hour)].sort((a, b) => a.rank - b.rank);
    });

    return grouped_wipe_dict;
}
