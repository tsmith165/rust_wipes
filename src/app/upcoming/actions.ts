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

export async function fetchFilteredServers(searchParams: SearchParams): Promise<GroupedWipeDict> {
    const region_filter = searchParams.region || 'US';
    const resource_rate_filter = searchParams.resource_rate || 'any';
    const group_limit_filter = searchParams.group_limit || 'any';
    const game_mode_filter = searchParams.game_mode || 'any';
    const min_rank_filter = Number(searchParams.min_rank) || 5000;
    const time_zone = Number(searchParams.time_zone) || 0;

    const selectedDate = searchParams.date
        ? moment.utc(searchParams.date).subtract(time_zone, 'hours')
        : moment.utc().subtract(time_zone, 'hours');
    const startOfDay = selectedDate.clone().startOf('day');
    const endOfDay = selectedDate.clone().endOf('day');

    console.log(`Filtering servers for UTC date range: ${startOfDay.format()} to ${endOfDay.format()}`);
    console.log(
        `Filters: ${region_filter}, ${resource_rate_filter}, ${group_limit_filter}, ${game_mode_filter}, Min Rank: ${min_rank_filter}`,
    );

    const query = db
        .select()
        .from(rw_parsed_server)
        .where(
            and(
                eq(rw_parsed_server.region, region_filter),
                or(
                    between(rw_parsed_server.next_wipe, startOfDay.toDate(), endOfDay.toDate()),
                    between(rw_parsed_server.next_full_wipe, startOfDay.toDate(), endOfDay.toDate()),
                ),
                lte(rw_parsed_server.rank, min_rank_filter),
                resource_rate_filter !== 'any' ? eq(rw_parsed_server.resource_rate, resource_rate_filter) : undefined,
                group_limit_filter !== 'any' ? eq(rw_parsed_server.group_limit, group_limit_filter) : undefined,
                game_mode_filter !== 'any' ? eq(rw_parsed_server.game_mode, game_mode_filter) : undefined,
            ),
        );

    console.log('Query:', query.toSQL());

    const servers = await query;

    console.log(`Found ${servers.length} servers matching the criteria`);

    const grouped_wipe_dict: GroupedWipeDict = {};
    servers.forEach((server) => {
        const fullWipeDate = server.next_full_wipe;
        const regularWipeDate = server.next_wipe;

        let wipeDate: Date | null = null;
        let isFullWipe = false;

        if (fullWipeDate && regularWipeDate) {
            wipeDate = fullWipeDate < regularWipeDate ? fullWipeDate : regularWipeDate;
            isFullWipe = fullWipeDate <= regularWipeDate;
        } else {
            wipeDate = fullWipeDate || regularWipeDate;
            isFullWipe = !!fullWipeDate;
        }

        if (wipeDate) {
            const localWipeDate = moment.utc(wipeDate).add(time_zone, 'hours');
            const wipe_hour = localWipeDate.hour();

            const last_wipe = server.last_wipe ? moment.utc(server.last_wipe).add(time_zone, 'hours').format('M/D h:mmA') : 'N/A';

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

    console.log('Grouped wipe dictionary:', grouped_wipe_dict);

    return grouped_wipe_dict;
}
