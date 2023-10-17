import styles from '../../../styles/pages/RecentServerList.module.scss';

import RecentServerRow from './RecentServerRow';

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

const RecentWipesTable = ({ state, update_filter_value, switch_page }) => {
    console.log('Creating Recent Wipes Table...');

    var servers_jsx_array = [];
    if (state.server_list == undefined) {
        console.log('NO SERVERS FOUND.  Returning empty table...');
        return <div className={styles.server_list_body_container}></div>;
    }

    var server_list_length = state.server_list.length;

    if (state.debug) console.log(`SERVER LIST LENGTH: ${server_list_length}`);
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

        if (state.debug) {
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
            />
        );
    }

    if (state.server_list == null) {
        return (
            <div className="relative bg-medium">
                {/* Loader can be implemented with Tailwind CSS or any other library */}
            </div>
        );
    }

    const pagination_container = (
        <div className="flex items-center space-x-2 bg-tertiary p-2 rounded-lg">
            <ArrowForwardIosRoundedIcon
                className="cursor-pointer rotate-180 hover:fill-secondary"
                onClick={(e) => {
                    e.preventDefault();
                    switch_page(false);
                }}
            />
            <span className="font-bold text-lg">{state.current_page}</span>
            <ArrowForwardIosRoundedIcon
                className="cursor-pointer hover:fill-secondary"
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
            className="py-2.5 px-2 border rounded-md bg-tertiary border-none"
            defaultValue={25}
            onChange={(e) => {
                e.preventDefault();
                const num_servers = document.getElementById('num_servers').value;
                console.log(`NEW NUM SERVERS: ${num_servers}`);
                update_filter_value('num_servers', num_servers);
            }}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
        </select>
    );

    const server_list_table_header = (
        <div className="flex text-light bg-tertiary">
            <div className="w-16 p-1.5 text-center">Rank</div>
            <div className="flex-1 p-1.5 text-left">Name</div>
            <div className="w-24 p-1.5 text-center">Players</div>
            <div className="w-16 p-1.5 text-center">Wiped</div>
            <div className="w-12 p-1.5 text-center">Copy</div>
        </div>
    );

    const server_list_table_row_container = (
        <div className="overflow-y-auto">
            <div className="bg-medium flex-1">{servers_jsx_array}</div>
        </div>
    );

    const server_list_table_menu = (
        <div className="flex justify-between items-center pr-2 pl-2 py-2 md:pl-0 bg-dark">
            {pagination_container /* Pagination */}
            {num_servers_select /* Number of servers selector */}
        </div>
    );

    console.log('Returning Recent Wipes Table...');
    return (
        <div
            className="bg-medium max-h-full min-w-full md:min-w-[461px]"
            style={{ flex: '1 1 60%' }}>
            <div className="h-[calc(100%-116px)] md:h-full w-full flex flex-col overflow-y-hidden">
                {server_list_table_header /* Server List Table Header */}
                {server_list_table_row_container /* Server List Table */}
                {server_list_table_menu /* Server List Table Menu */}
            </div>
        </div>
    );
};

export default RecentWipesTable;
