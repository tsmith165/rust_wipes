import React from 'react';
import moment from 'moment-timezone';
import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';
import { fetchFilteredServers } from '@/app/upcoming/actions';

interface SearchParams {
    region?: string;
    resource_rate?: string;
    group_limit?: string;
    game_mode?: string;
    min_rank?: string;
    time_zone?: string;
    date?: string;
}

const defaultParams: SearchParams = {
    region: 'US',
    resource_rate: 'any',
    group_limit: 'any',
    game_mode: 'any',
    min_rank: '5000',
    time_zone: '-7', // Pacific Time
    date: moment().format('YYYY-MM-DD'),
};

export default async function UpcomingWipesPage({ searchParams }: { searchParams: SearchParams }) {
    // Merge default params with provided search params
    const mergedParams: SearchParams = { ...defaultParams, ...searchParams };

    const selectedDate = mergedParams.date ? moment(mergedParams.date) : moment();
    const timeZone = Number(mergedParams.time_zone);
    console.log('Selected date: ', selectedDate.format('YYYY-MM-DD'), 'Time Zone:', timeZone);

    const serverList = await fetchFilteredServers(mergedParams);

    const serversJsxArray =
        Object.keys(serverList).length > 0
            ? Object.entries(serverList)
                  .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
                  .map(([wipeHour, servers]) => (
                      <UpcomingServerHourGroup key={wipeHour} wipe_dict={servers} wipe_hour={parseInt(wipeHour)} time_zone={timeZone} />
                  ))
            : [];

    return (
        <div className="h-full w-full overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
                <div className="h-full w-full bg-stone-800 md:w-[35%] md:min-w-[35%] md:max-w-[35%]">
                    <UpcomingWipesSidebar searchParams={mergedParams} />
                </div>
                <div className="h-full min-w-full flex-grow overflow-y-auto bg-stone-900 md:w-[65%] md:min-w-[65%]">
                    {serversJsxArray.length > 0 ? (
                        serversJsxArray
                    ) : (
                        <div className="p-2">No upcoming wipes found for the selected date and filters.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
