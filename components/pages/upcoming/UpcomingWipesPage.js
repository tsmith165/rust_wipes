import { prisma } from '@/lib/prisma';

import React from 'react';
import PropTypes from 'prop-types';

import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';

export default async function UpcomingWipesPage(searchParams) {
    async function fetchFilteredServers(date) {
        // Convert searchParams to a suitable format for your Prisma query
        //const date_filter = searchParams.date ? new Date(searchParams.date) : undefined;
        const region_filter = searchParams.region || 'US';
        const resource_rate_filter = searchParams.resource_rate || '1x';
        const group_limit_filter = searchParams.group_limit || 'solo';
        const game_mode_filter = searchParams.game_mode || 'pvp';

        // next wipe within the next day

        const servers = await prisma.server_parsed.findMany({
            where: {
                next_wipe: {
                    lte: new Date(date.setDate(date.getDate() + 1)).toISOString(),
                },
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
        <div className="h-full w-full overflow-hidden bg-grey ">
            <div className="relative flex h-full w-full flex-col overflow-hidden align-top md-nav:flex-row">
                <UpcomingWipesSidebar />
                <div className="h-full min-w-[50ch] flex-1 overflow-y-auto md:max-h-[calc(100%-90px)]">
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
