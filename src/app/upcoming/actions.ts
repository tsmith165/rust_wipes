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
    const { region, resource_rate, group_limit, game_mode, min_rank, time_zone, date } = searchParams;

    const selectedDate = date ? moment.utc(date).subtract(Number(time_zone), 'hours') : moment.utc().subtract(Number(time_zone), 'hours');
    const startOfDay = selectedDate.clone().startOf('day');
    const endOfDay = selectedDate.clone().endOf('day');

    console.log(`Filtering servers for UTC date range: ${startOfDay.format()} to ${endOfDay.format()}`);
    console.log(`Filters: ${region}, ${resource_rate}, ${group_limit}, ${game_mode}, Min Rank: ${min_rank}`);

    const query = db
        .select()
        .from(rw_parsed_server)
        .where(
            and(
                eq(rw_parsed_server.region, String(region)),
                or(
                    between(rw_parsed_server.next_wipe, startOfDay.toDate(), endOfDay.toDate()),
                    between(rw_parsed_server.next_full_wipe, startOfDay.toDate(), endOfDay.toDate()),
                ),
                lte(rw_parsed_server.rank, Number(min_rank)),
                resource_rate !== 'any' ? eq(rw_parsed_server.resource_rate, String(resource_rate)) : undefined,
                group_limit !== 'any' ? eq(rw_parsed_server.group_limit, String(group_limit)) : undefined,
                game_mode !== 'any' ? eq(rw_parsed_server.game_mode, String(game_mode)) : undefined,
            ),
        );

    console.log('Query:', query.toSQL());

    const servers = await query;

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
            const utcWipeDate = moment.utc(wipeDate);
            const wipe_hour = utcWipeDate.hour(); // Use UTC hour for grouping

            const last_wipe = server.last_wipe ? moment.utc(server.last_wipe).add(time_zone, 'hours').format('M/D h:mmA') : 'N/A';
            const next_wipe = utcWipeDate.add(time_zone, 'hours').format('M/D h:mmA');

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

    return grouped_wipe_dict;
}
