import React from 'react';
import PropTypes from 'prop-types';
import RecentServerRow from './RecentServerRow';

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

const DEBUG = false;

const RecentWipesTable = ({ state, update_filter_value, switch_page }) => {
    console.log('Creating Recent Wipes Table...');

    var servers_jsx_array = [];
    if (state.server_list == undefined) {
        console.log('NO SERVERS FOUND.  Returning empty table...');
        return <div className="max-h-full min-w-full bg-dark md:min-w-[461px]" style={{ flex: '1 1 60%' }}></div>;
    }

    var server_list_length = state.server_list.length;

    if (DEBUG) console.log(`SERVER LIST LENGTH: ${server_list_length}`);
    console.log(state.server_list);

    for (var i = 0; i < server_list_length; i++) {
        var current_server_json = state.server_list[i];

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

        console.log(`Pushing ID: {id}`);
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

    if (state.server_list == null || state.server_list.length == 0) {
        return (
            <div className="max-h-full min-w-full bg-dark md:min-w-[461px]" style={{ flex: '1 1 60%' }}>
                {/* Loader can be implemented with Tailwind CSS or any other library */}
            </div>
        );
    }

    const pagination_container = (
        <div className="flex items-center space-x-2 rounded-lg bg-secondary p-2">
            <ArrowForwardIosRoundedIcon
                className="rotate-180 cursor-pointer hover:fill-primary"
                onClick={(e) => {
                    e.preventDefault();
                    switch_page(false);
                }}
            />
            <span className="text-lg font-bold">{state.current_page}</span>
            <ArrowForwardIosRoundedIcon
                className="cursor-pointer hover:fill-primary"
                onClick={(e) => {
                    e.preventDefault();
                    switch_page(true);
                }}
            />
        </div>
    );

    const num_servers_select = (
        <select
            id="num_servers"
            className="rounded-md border border-none bg-secondary px-2 py-2.5"
            defaultValue={25}
            onChange={(e) => {
                e.preventDefault();
                const num_servers = document.getElementById('num_servers').value;
                console.log(`NEW NUM SERVERS: ${num_servers}`);
                update_filter_value('num_servers', num_servers);
            }}
        >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
        </select>
    );

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
        <div className="overflow-y-auto">
            <div className="flex-1 bg-dark">{servers_jsx_array}</div>
        </div>
    );

    const server_list_table_menu = (
        <div className="flex items-center justify-between bg-black py-2 pl-2 pr-2 md:pl-0">
            {pagination_container /* Pagination */}
            {num_servers_select /* Number of servers selector */}
        </div>
    );

    console.log('Returning Recent Wipes Table...');
    return (
        <div className="max-h-full min-w-full bg-dark md:min-w-[461px]" style={{ flex: '1 1 60%' }}>
            <div className="flex h-[calc(100%-116px)] w-full flex-col overflow-y-hidden md:h-full">
                {server_list_table_header /* Server List Table Header */}
                {server_list_table_row_container /* Server List Table */}
                {server_list_table_menu /* Server List Table Menu */}
            </div>
        </div>
    );
};

export default RecentWipesTable;

RecentWipesTable.propTypes = {
    state: PropTypes.object,
    update_filter_value: PropTypes.func,
    switch_page: PropTypes.func,
};
