import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import RecentServerRow from './RecentServerRow';
import NumServersSelect from './NumServersSelect';

import { IoIosArrowForward } from 'react-icons/io';

const DEBUG = false;

const RecentWipesTable = ({ searchParams, server_list }) => {
    console.log('Creating Recent Wipes Table...');
    console.log('Recent Wipes Table Search Params: ', searchParams);

    const page = parseInt(searchParams.page) || 1;
    const numServers = parseInt(searchParams.numServers) || 25;
    const minPlayers = parseInt(searchParams.minPlayers) || 2;
    const maxDist = parseInt(searchParams.maxDist) || 5000;
    const country = searchParams.country || 'NA';

    // Construct the base URL
    const base_url = '/recent';

    // Construct the query string from the current search parameters
    // This includes parameters not directly changed by the form
    const current_query_string = queryString.stringify({
        page, // Assuming you want to keep the current page in the URL
        numServers,
        minPlayers,
        maxDist,
        country,
    });

    const form_action_url = `${base_url}?${current_query_string}`;
    console.log('Using following form_action_url for updating query string: ' + form_action_url);

    var servers_jsx_array = [];
    if (server_list == undefined) {
        console.log('NO SERVERS FOUND.  Returning empty table...');
        return <div className="max-h-full min-w-full bg-dark md:min-w-[461px]" style={{ flex: '1 1 60%' }}></div>;
    }

    var server_list_length = server_list.length;

    if (DEBUG) console.log(`SERVER LIST LENGTH: ${server_list_length}`);

    for (var i = 0; i < server_list_length; i++) {
        var current_server_json = server_list[i];

        var offline = current_server_json.offline || false;

        var id = current_server_json['id'];
        var ip = current_server_json['attributes']['ip'];
        var port = current_server_json['attributes']['port'];
        var name = current_server_json['title'];
        var rank = current_server_json['rank'];
        var players = current_server_json['attributes']['players'];
        var max_players = current_server_json['attributes']['maxPlayers'];
        var wipe_date = current_server_json['last_wipe'];

        if (DEBUG) {
            console.log(`Server ID: ${id} | Name: ${name} | Rank: ${rank}`);
            console.log(`Wipe Date: ${wipe_date}`);
            console.log(`Players: ${players} | Max Players: ${max_players}`);
            console.log('--------------------------------------------------------------------');
        }

        servers_jsx_array.push(
            <RecentServerRow
                key={i}
                ip={`${ip}:${port}`}
                offline={offline}
                id={`server-${i}`}
                className={name}
                url={`https://www.battlemetrics.com/servers/rust/${id}`}
                rank={rank}
                players={players}
                max_players={max_players}
                wipe_date={wipe_date}
            />,
        );
    }

    if (server_list == null || server_list.length == 0) {
        return (
            <div className="max-h-full min-w-full bg-dark md:min-w-[461px]" style={{ flex: '1 1 60%' }}>
                {/* Loader can be implemented with Tailwind CSS or any other library */}
            </div>
        );
    }

    const decrementPage = page > 1 ? page - 1 : 1;
    const incrementPage = page + 1;

    const pagination_container = (
        <div className="flex items-center space-x-2 rounded-lg bg-secondary p-2">
            <form method="GET" action="/recent">
                <input type="hidden" name="page" value={decrementPage} />
                <input type="hidden" name="numServers" value={numServers} />
                <input type="hidden" name="minPlayers" value={minPlayers} />
                <input type="hidden" name="maxDist" value={maxDist} />
                <input type="hidden" name="country" value={country} />
                <button type="submit" className="p-2">
                    <IoIosArrowForward className="rotate-180 cursor-pointer fill-grey hover:fill-light" />
                </button>
            </form>
            <span className="text-lg font-bold">{page}</span>
            <form method="GET" action="/recent">
                <input type="hidden" name="page" value={incrementPage} />
                <input type="hidden" name="numServers" value={numServers} />
                <input type="hidden" name="minPlayers" value={minPlayers} />
                <input type="hidden" name="maxDist" value={maxDist} />
                <input type="hidden" name="country" value={country} />
                <button type="submit" className="p-2">
                    <IoIosArrowForward className="cursor-pointer fill-grey hover:fill-light" />
                </button>
            </form>
        </div>
    );

    const num_servers_select = <NumServersSelect defaultValue={numServers} searchParams={searchParams} />;

    const server_list_table_header = (
        <div className="flex bg-grey pr-2 font-bold text-primary">
            <div className="w-16 p-1.5 text-center">Rank</div>
            <div className="flex-1 p-1.5 text-left">Name</div>
            <div className="w-24 p-1.5 text-center">Players</div>
            <div className="w-20 p-1.5 text-center">Wiped</div>
            <div className="w-12 p-1.5 text-center">Copy</div>
        </div>
    );

    const server_list_table_row_container = (
        <div className="grow overflow-y-auto">
            <div className="flex-1 bg-dark">{servers_jsx_array}</div>
        </div>
    );

    const server_list_table_menu = (
        <div className="flex w-full items-center justify-between bg-black py-2 pl-2 md:pl-0">
            {pagination_container /* Pagination */}
            <div className="flex-grow"></div>
            {num_servers_select /* Number of servers selector */}=
        </div>
    );

    console.log('Returning Recent Wipes Table...');
    return (
        <div className="max-h-full w-full bg-dark md:min-w-[461px]" style={{ flex: '1 1 65%' }}>
            <div className="flex h-[calc(100%-74px)] w-full flex-col overflow-y-hidden md:h-full">
                {server_list_table_header /* Server List Table Header */}
                {server_list_table_row_container /* Server List Table */}
                {server_list_table_menu /* Server List Table Menu */}
            </div>
        </div>
    );
};

export default RecentWipesTable;

RecentWipesTable.propTypes = {
    searchParams: PropTypes.object,
    server_list: PropTypes.array,
};
