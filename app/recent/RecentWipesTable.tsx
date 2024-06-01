import React from 'react';
import queryString from 'query-string';
import { IoIosArrowForward } from 'react-icons/io';
import RecentServerRow from './RecentServerRow';
import NumServersSelect from './NumServersSelect';

const DEBUG = false;

interface ServerListItem {
    id: number;
    attributes: {
        ip: string | null;
        port: number | null;
        name: string | null;
        rank: number | null;
        players: number | null;
        maxPlayers: number | null;
        details: {
            rust_last_wipe: string | null;
        };
    };
    offline?: boolean;
}

interface RecentWipesTableProps {
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
    server_list: ServerListItem[];
}

const RecentWipesTable: React.FC<RecentWipesTableProps> = ({ searchParams, server_list }) => {
    console.log('Creating Recent Wipes Table...');

    const page = parseInt((searchParams?.page as string) || '1');
    const numServers = parseInt((searchParams?.numServers as string) || '25');
    const minPlayers = parseInt((searchParams?.minPlayers as string) || '2');
    const maxDist = parseInt((searchParams?.maxDist as string) || '5000');
    const country = (searchParams?.country as string) || 'NA';

    const base_url = '/recent';
    const current_query_string = queryString.stringify({
        page,
        numServers,
        minPlayers,
        maxDist,
        country,
    });

    const form_action_url = `${base_url}?${current_query_string}`;
    console.log('Using following form_action_url for updating query string: ' + form_action_url);

    const servers_jsx_array: JSX.Element[] = [];

    if (server_list == undefined) {
        console.log('NO SERVERS FOUND.  Returning empty table...');
        return <div className="max-h-full min-w-full bg-secondary md:min-w-[461px]" style={{ flex: '1 1 60%' }}></div>;
    }

    const server_list_length = server_list.length;

    if (DEBUG) console.log(`SERVER LIST LENGTH: ${server_list_length}`);

    for (let i = 0; i < server_list_length; i++) {
        const current_server_json = server_list[i];
        const offline = current_server_json.offline || false;
        const id = current_server_json.id;
        const ip = current_server_json.attributes.ip;
        const port = current_server_json.attributes.port;
        const name = current_server_json.attributes.name;
        const rank = current_server_json.attributes.rank;
        const players = current_server_json.attributes.players;
        const maxPlayers = current_server_json.attributes.maxPlayers;
        const wipe_date = current_server_json.attributes.details?.rust_last_wipe;

        if (DEBUG) {
            console.log(`Server ID: ${id} | Name: ${name} | Rank: ${rank}`);
            console.log(`Wipe Date: ${players}`);
            console.log('--------------------------------------------------------------------');
        }

        servers_jsx_array.push(
            <RecentServerRow
                key={i}
                ip={`${ip}:${port}`}
                offline={offline}
                id={id}
                className={name || ''}
                url={`https://www.battlemetrics.com/servers/rust/${id}`}
                rank={rank || 0}
                players={players || ''}
                wipe_date={players || ''}
            />,
        );
    }

    if (server_list == null || server_list.length === 0) {
        return (
            <div className="max-h-full min-w-full bg-secondary md:min-w-[461px]" style={{ flex: '1 1 60%' }}>
                {/* Loader can be implemented with Tailwind CSS or any other library */}
            </div>
        );
    }

    const decrementPage = page > 1 ? page - 1 : 1;
    const incrementPage = page + 1;

    const pagination_container = (
        <div className="flex items-center space-x-2 rounded-lg bg-primary_dark p-1">
            <form method="GET" action="/recent" className="flex items-center">
                <input type="hidden" name="page" value={decrementPage} />
                <input type="hidden" name="numServers" value={numServers} />
                <input type="hidden" name="minPlayers" value={minPlayers} />
                <input type="hidden" name="maxDist" value={maxDist} />
                <input type="hidden" name="country" value={country} />
                <button type="submit" className="flex items-center justify-center px-0 py-1">
                    <IoIosArrowForward className="rotate-180 cursor-pointer fill-secondary_dark text-2xl hover:fill-primary_light" />
                </button>
            </form>
            <span className="flex items-center justify-center text-lg font-bold">{page}</span>
            <form method="GET" action="/recent" className="flex items-center">
                <input type="hidden" name="page" value={incrementPage} />
                <input type="hidden" name="numServers" value={numServers} />
                <input type="hidden" name="minPlayers" value={minPlayers} />
                ``
                <input type="hidden" name="maxDist" value={maxDist} />
                <input type="hidden" name="country" value={country} />
                <button type="submit" className="flex items-center justify-center px-0 py-1">
                    <IoIosArrowForward className="cursor-pointer fill-secondary_dark text-2xl hover:fill-primary_light" />
                </button>
            </form>
        </div>
    );

    const num_servers_select = <NumServersSelect defaultValue={numServers} searchParams={searchParams} />;

    const server_list_table_header = (
        <div className="flex bg-secondary_light pr-2 font-bold text-primary">
            <div className="w-16 p-1.5 text-center">Rank</div>
            <div className="flex-1 p-1.5 text-left">Name</div>
            <div className="w-24 p-1.5 text-center">Players</div>
            <div className="w-20 p-1.5 text-center">Wiped</div>
            <div className={`${numServers > 10 ? 'mr-2' : ''} w-12 p-1.5 text-center`}>Copy</div>
        </div>
    );

    const server_list_table_row_container = (
        <div className="grow overflow-y-auto">
            <div className="flex-1 bg-secondary">{servers_jsx_array}</div>
        </div>
    );

    const server_list_table_menu = (
        <div className="flex w-full items-center justify-between bg-secondary_dark py-2 pl-2 md:pl-0">
            {pagination_container /* Pagination */}
            <div className="flex-grow"></div>
            {num_servers_select /* Number of servers selector */}
        </div>
    );

    console.log('Returning Recent Wipes Table...');
    return (
        <div className="max-h-full w-full bg-secondary md:min-w-[461px]" style={{ flex: '1 1 65%' }}>
            <div className="flex h-[calc(100%-99px)] w-full flex-col overflow-y-hidden md:h-full">
                {server_list_table_header /* Server List Table Header */}
                {server_list_table_row_container /* Server List Table */}
                {server_list_table_menu /* Server List Table Menu */}
            </div>
        </div>
    );
};

export default RecentWipesTable;
