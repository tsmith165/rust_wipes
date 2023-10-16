'use client';

import React, { useEffect, useState } from 'react';
import UpcomingWipesSidebar from './UpcomingWipesSidebar';
import UpcomingServerHourGroup from './UpcomingServerHourGroup';
import { fetch_upcoming_servers_for_week_day } from '@/lib/api_calls';
import { useAnalytics } from '@/lib/helpers/useAnalytics';

const DAY_OF_WEEK_DICT = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};

const DEFAULT_TIME_ZONE = -7;

const UpcomingWipesPage = () => {
    useAnalytics();

    const [state, setState] = useState({
        serverList: null,
        minRank: 5000,
        date: new Date(),
        wipeDayHeaderStr: '',
        timeZone: DEFAULT_TIME_ZONE,
        region: 'US',
        gameMode: 'any',
        resourceRate: 'any',
        groupLimit: 'any',
    });

    const effect_dependencies = [
        state.date,
        state.timeZone,
        state.minRank,
        state.region,
        state.resourceRate,
        state.groupLimit,
        state.gameMode,
    ];

    useEffect(() => {
        fetch_servers();
    }, effect_dependencies);

    const fetch_servers = async () => {
        const { date, timeZone, minRank, region, resourceRate, groupLimit, gameMode } = state;
        const curDay = date.getDate();
        const currentWeekday = date.getDay();
        const forceWipe = currentWeekday === 4 && curDay < 7;
        const wipeDayHeaderStr = forceWipe
            ? 'Force Wipes'
            : `${DAY_OF_WEEK_DICT[currentWeekday]} Wipes`;

        const serverList = await fetch_upcoming_servers_for_week_day(
            date,
            timeZone,
            minRank,
            region,
            resourceRate,
            groupLimit,
            gameMode
        );

        setState((prevState) => ({
            ...prevState,
            serverList,
            wipeDayHeaderStr,
        }));
    };

    const update_filter_value = (filter, newValue) => {
        setState((prevState) => ({
            ...prevState,
            [filter]: newValue,
        }));
    };

    const { serverList } = state;
    const serversJsxArray = serverList
        ? Object.keys(serverList).map((wipeHour) => (
              <UpcomingServerHourGroup
                  key={wipeHour}
                  wipeArray={serverList[wipeHour]}
                  wipeHour={wipeHour}
              />
          ))
        : [];

    return (
        <div className="h-full w-full overflow-hidden bg-gray-500 ">
            <div className="relative flex flex-col md-nav:flex-row h-full w-full overflow-hidden align-top">
                <UpcomingWipesSidebar update_filter_value={update_filter_value} state={state} />
                <div className="overflow-y-auto h-full flex-1 min-w-[50ch] md:max-h-[calc(100%-90px)]">
                    {serverList === null ? (
                        <div className="border-t-4 border-b-4 border-primary rounded-full w-20 h-20 m-auto animate-spin" />
                    ) : serversJsxArray?.length < 1 ? (
                        <div>Under construction...</div>
                    ) : (
                        serversJsxArray
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpcomingWipesPage;
