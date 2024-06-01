import { db } from '@/db/db';
import { rw_parsed_server } from '@/db/schema';
import { eq, lt, and } from 'drizzle-orm';

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';

export default async function UpcomingWipesPage(searchParams) {
    async function fetchFilteredServers(date) {
        const region_filter = searchParams.region || 'US';
        const resource_rate_filter = searchParams.resource_rate || '1x';
        const group_limit_filter = searchParams.group_limit || 'trio';
        const game_mode_filter = searchParams.game_mode || 'pvp';
        const min_rank_filter = searchParams.min_rank || 20000;
        const time_zone = searchParams.time_zone || 0;

        const passed_dow = parseInt(date.format('d'));
        const passed_week = parseInt(date.format('W'));

        console.log(
            `Filtering servers for DOW: ${passed_dow} / Week: ${passed_week} - ${region_filter}, ${resource_rate_filter}, ${group_limit_filter}, ${game_mode_filter}`,
        );

        const drizzle_params = and(
            eq(rw_parsed_server.region, region_filter),
            eq(rw_parsed_server.next_wipe_week, parseInt(passed_week)),
            eq(rw_parsed_server.next_wipe_dow, parseInt(passed_dow)),
            lt(rw_parsed_server.rank, min_rank_filter + 1),
            resource_rate_filter != 'any' && resource_rate_filter != null
                ? eq(rw_parsed_server.resource_rate, resource_rate_filter)
                : eq(1, 1),
            group_limit_filter != 'any' && group_limit_filter != null ? eq(rw_parsed_server.group_limit, group_limit_filter) : eq(1, 1),
            game_mode_filter != 'any' && game_mode_filter != null ? eq(rw_parsed_server.game_mode, game_mode_filter) : eq(1, 1),
        );

        const servers = await db.select().from(rw_parsed_server).where(drizzle_params);

        var grouped_wipe_dict = {};
        servers.forEach((wipe) => {
            if (wipe.next_wipe_dow == passed_dow) {
                const time_zoned_wipe_hour = Math.abs((parseInt(wipe.next_wipe_hour) + time_zone) % 24);

                const wipe_data = {
                    id: wipe.id,
                    rank: wipe.rank,
                    title: wipe.title,
                    wipe_hour: time_zoned_wipe_hour,
                    last_wipe_date: wipe.last_wipe,
                };
                if (grouped_wipe_dict[time_zoned_wipe_hour] == undefined) {
                    grouped_wipe_dict[time_zoned_wipe_hour] = [wipe_data];
                } else {
                    grouped_wipe_dict[time_zoned_wipe_hour].push(wipe_data);
                }
            }
        });

        return grouped_wipe_dict;
    }

    // create date object using moment, if current date time is past 6PM, set to next day
    const current_date = moment();
    if (current_date.hour() > 18) {
        current_date.add(1, 'days');
    }

    console.log('Current date: ', current_date.format('YYYY-MM-DD'));
    const serverList = await fetchFilteredServers(current_date);
    console.log(`Found following servers for date ${current_date}: `, serverList);

    const serversJsxArray = serverList
        ? Object.keys(serverList).map((wipeHour) => (
              <UpcomingServerHourGroup key={wipeHour} wipe_dict={serverList[wipeHour]} wipe_hour={wipeHour} />
          ))
        : [];
    console.log('Using following serversJsxArray: ', serversJsxArray);
    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-wrap">
                <UpcomingWipesSidebar />
                <div className="bg-secondary_light h-full min-w-full flex-grow md:min-w-[461px]" style={{ flex: '1 1 65%' }}>
                    {serverList?.length < 1 ? <div>No servers found</div> : serversJsxArray}
                </div>
            </div>
        </div>
    );
}

UpcomingWipesPage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};