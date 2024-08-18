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
    const minRank = parseInt((searchParams?.minRank as string) || '0');
    const maxRank = parseInt((searchParams?.maxRank as string) || '10000');
    const country = (searchParams?.country as string) || 'US';
    const groupLimit = (searchParams?.groupLimit as string) || 'any';
    const resourceRate = (searchParams?.resourceRate as string) || 'any';

    const base_url = '/recent';
    const current_query_string = queryString.stringify({
        page,
        numServers,
        minPlayers,
        maxDist,
        minRank,
        maxRank,
        country,
        groupLimit,
        resourceRate,
    });

    const form_action_url = `${base_url}?${current_query_string}`;
    console.log('Using following form_action_url for updating query string: ' + form_action_url);

    const servers_jsx_array: JSX.Element[] = [];

    if (server_list == undefined) {
        console.log('NO SERVERS FOUND.  Returning empty table...');
        return <div className="max-h-full min-w-full bg-stone-500 md:min-w-[461px]" style={{ flex: '1 1 60%' }}></div>;
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
                ip={`${ip}  `}
                offline={offline}
                id={id}
                className={name || ''}
                url={`https://www.battlemetrics.com/servers/rust/${id}`}
                rank={rank || 0}
                players={players || 0}
                maxPlayers={maxPlayers || 0}
                wipe_date={wipe_date || ''}
            />,
        );
    }

    if (server_list == null || server_list.length === 0) {
        return (
            <div className="max-h-full w-full min-w-full bg-stone-500 md:min-w-[461px]">
                {/* Loader can be implemented with Tailwind CSS or any other library */}
            </div>
        );
    }

    const decrementPage = page > 1 ? page - 1 : 1;
    const incrementPage = page + 1;

    const pagination_container = (
        <div className="flex items-center space-x-2 rounded-lg bg-primary_dark">
            <form method="GET" action="/recent" className="flex items-center ">
                <input type="hidden" name="page" value={decrementPage} />
                <input type="hidden" name="numServers" value={numServers} />
                <input type="hidden" name="minPlayers" value={minPlayers} />
                <input type="hidden" name="maxDist" value={maxDist} />
                <input type="hidden" name="minRank" value={minRank} />
                <input type="hidden" name="maxRank" value={maxRank} />
                <input type="hidden" name="country" value={country} />
                <input type="hidden" name="groupLimit" value={groupLimit} />
                <input type="hidden" name="resourceRate" value={resourceRate} />
                <button type="submit" className="group flex items-center justify-center rounded-l-lg p-1 hover:!bg-primary">
                    <IoIosArrowForward className="rotate-180 cursor-pointer fill-stone-950 text-xl group-hover:fill-stone-300" />
                </button>
            </form>
            <span className="flex items-center justify-center text-lg font-bold">{page}</span>
            <form method="GET" action="/recent" className="flex items-center">
                <input type="hidden" name="page" value={incrementPage} />
                <input type="hidden" name="numServers" value={numServers} />
                <input type="hidden" name="minPlayers" value={minPlayers} />
                <input type="hidden" name="maxDist" value={maxDist} />
                <input type="hidden" name="minRank" value={minRank} />
                <input type="hidden" name="maxRank" value={maxRank} />
                <input type="hidden" name="country" value={country} />
                <input type="hidden" name="groupLimit" value={groupLimit} />
                <input type="hidden" name="resourceRate" value={resourceRate} />
                <button type="submit" className="group flex items-center justify-center rounded-r-lg p-1 hover:!bg-primary">
                    <IoIosArrowForward className="cursor-pointer fill-stone-950 text-xl group-hover:fill-stone-300" />
                </button>
            </form>
        </div>
    );

    const num_servers_select = <NumServersSelect defaultValue={numServers} searchParams={searchParams} />;

    const server_list_table_header = (
        <div className="flex bg-stone-600 pr-2 font-bold text-stone-300">
            <div className="w-16 p-1.5 text-center">Rank</div>
            <div className="flex-1 p-1.5 text-left">Name</div>
            <div className="w-24 p-1.5 text-center">Players</div>
            <div className="w-20 p-1.5 text-center">Wiped</div>
            <div className={`${numServers > 10 ? 'mr-1' : ''} w-12 p-1.5 text-center`}>Copy</div>
        </div>
    );

    const server_list_table_row_container = (
        <div className="grow overflow-y-auto">
            <div className="flex-1 bg-stone-400">{servers_jsx_array}</div>
        </div>
    );

    const server_list_table_menu = (
        <div className="flex w-full items-center justify-between bg-stone-800 px-2 py-2">
            {pagination_container /* Pagination */}
            <div className="flex-grow"></div>
            {num_servers_select /* Number of servers selector */}
        </div>
    );

    console.log('Returning Recent Wipes Table...');
    return (
        <div className="flex h-[calc(100%-254px)] w-full flex-grow bg-stone-400 md:h-full md:min-w-[461px]">
            <div className="flex w-full flex-col overflow-y-hidden">
                {server_list_table_header}
                {server_list_table_row_container}
                {server_list_table_menu}
            </div>
        </div>
    );
};

export default RecentWipesTable;
