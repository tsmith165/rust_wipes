import { prisma } from '@/lib/prisma';

import React from 'react';
import PropTypes from 'prop-types';

import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';

export default async function UpcomingWipesPage(searchParams) {
    async function fetchFilteredServers(date) {
        const region_filter = searchParams.region || 'US';
        const resource_rate_filter = searchParams.resource_rate || '1x';
        const group_limit_filter = searchParams.group_limit || 'solo';
        const game_mode_filter = searchParams.game_mode || 'pvp';

        // const current_hour = current_date.getHours();
        const current_dow = date.getDay();
        const current_week = Math.floor(date.getDate() / 7);

        console.log(
            `Filtering servers for date ${date}: ${region_filter}, ${resource_rate_filter}, ${group_limit_filter}, ${game_mode_filter}`,
        );

        const servers = await prisma.server_parsed.findMany({
            where: {
                next_wipe_week: current_week,
                next_wipe_dow: current_dow,
                region: region_filter,
                resource_rate: resource_rate_filter,
                group_limit: group_limit_filter,
                game_mode: game_mode_filter,
            },
        });
        return servers;
    }

    const current_date = new Date();
    const serverList = await fetchFilteredServers(current_date);
    console.log(`Found following servers for date ${current_date}: ${serverList}`);
    const serversJsxArray = serverList
        ? Object.keys(serverList).map((wipeHour) => (
              <UpcomingServerHourGroup key={wipeHour} wipe_dict={serverList[wipeHour]} wipe_hour={wipeHour} />
          ))
        : [];

    console.log('Server List: ', serverList);
    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-wrap">
                <UpcomingWipesSidebar />
                <div className="h-full min-w-full flex-grow bg-grey md:min-w-[461px]" style={{ flex: '1 1 65%' }}>
                    {serverList === null || serverList === undefined ? (
                        <div className="m-auto h-20 w-20 animate-spin rounded-full border-b-4 border-t-4 border-light" />
                    ) : serverList?.length < 1 ? (
                        <div>Under construction...</div>
                    ) : (
                        serversJsxArray
                    )}
                </div>
            </div>
        </div>
    );
}

UpcomingWipesPage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};
