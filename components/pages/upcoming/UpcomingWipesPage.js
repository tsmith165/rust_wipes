import { prisma } from '@/lib/prisma';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';

const UpcomingWipesPage = ({ filters }) => {
    async function fetchFilteredServers(date) {
        // Convert filters to a suitable format for your Prisma query
        const date_filter = filters.date ? new Date(filters.date) : undefined;
        const region_filter = filters.region ? filters.region : undefined;
        const resource_rate_filter = filters.resource_rate ? filters.resource_rate : undefined;
        const group_limit_filter = filters.group_limit ? filters.group_limit : undefined;
        const game_mode_filter = filters.game_mode ? filters.game_mode : undefined;

        // Format the date as needed and construct your query
        const servers = await prisma.server_parsed.findMany({
            where: {
                next_wipe: date,
                region: region_filter,
                resource_rate: resource_rate_filter,
                group_limit: group_limit_filter,
                game_mode: game_mode_filter,
            },
        });
        return servers;
    }

    const current_date = new Date();
    const serverList = fetchFilteredServers(current_date);
    console.log(`Found following servers for date ${current_date}: ${serverList}`);
    const serversJsxArray = serverList
        ? Object.keys(serverList).map((wipeHour) => (
              <UpcomingServerHourGroup key={wipeHour} wipeArray={serverList[wipeHour]} wipeHour={wipeHour} />
          ))
        : [];

    return (
        <div className="h-full w-full overflow-hidden bg-grey ">
            <div className="relative flex h-full w-full flex-col overflow-hidden align-top md-nav:flex-row">
                <UpcomingWipesSidebar />
                <div className="h-full min-w-[50ch] flex-1 overflow-y-auto md:max-h-[calc(100%-90px)]">
                    {serverList === null ? (
                        <div className="m-auto h-20 w-20 animate-spin rounded-full border-b-4 border-t-4 border-light" />
                    ) : serverList?.length < 1 ? (
                        <div>Under construction...</div>
                    ) : (
                        serverList
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingWipesPage;
