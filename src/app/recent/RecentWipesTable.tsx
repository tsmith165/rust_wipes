import React, { type JSX } from 'react';
import queryString from 'query-string';
import RecentServerRow from './RecentServerRow';

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
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    server_list: ServerListItem[];
    onUpdateSearchParams: (updates: Record<string, string>) => void;
}

const RecentWipesTable: React.FC<RecentWipesTableProps> = ({ searchParams, server_list }) => {
    console.log('Creating Recent Wipes Table...');

    const page = parseInt((searchParams?.page as string) || '1');
    const numServers = parseInt((searchParams?.numServers as string) || '10');
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
        return <div className="max-h-full min-w-full bg-st_dark md:min-w-[461px]" style={{ flex: '1 1 60%' }}></div>;
    }

    const server_list_length = server_list.length;

    if (DEBUG) console.log(`SERVER LIST LENGTH: ${server_list_length}`);

    for (let i = 0; i < server_list_length; i++) {
        const current_server_json = server_list[i];
        const offline = current_server_json.offline || false;
        const id = current_server_json.id;
        const ip = current_server_json.attributes.ip;
        const name = current_server_json.attributes.name;
        const rank = current_server_json.attributes.rank;
        const players = current_server_json.attributes.players;
        const maxPlayers = current_server_json.attributes.maxPlayers;
        const wipe_date = current_server_json.attributes.details?.rust_last_wipe;

        if (DEBUG) {
            console.log(`Server ID: ${id} | Name: ${name} | Rank: ${rank}`);
            console.log(`Wipe Date: ${players}`);
            console.log('----------------------------------------------------   ');
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
            <div className="max-h-full w-full min-w-full bg-st_dark md:min-w-[461px]">
                {/* Loader can be implemented with Tailwind CSS or any other library */}
            </div>
        );
    }

    const server_list_table_header = (
        <div className="flex bg-st_dark pr-2 font-bold text-st_lightest">
            <div className="w-20 p-1.5 text-center">Rank</div>
            <div className="flex-1 p-1.5 text-left">Name</div>
            <div className="w-28 p-1.5 text-center">Players</div>
            <div className="w-24 p-1.5 text-center">Wiped</div>
            <div className={`${numServers > 10 ? 'mr-1' : ''} w-12 p-1.5 text-center`}>Copy</div>
        </div>
    );

    const server_list_table_row_container = (
        <div className="grow overflow-y-auto bg-st">
            <div className="flex-1">{servers_jsx_array}</div>
        </div>
    );

    console.log('Returning Recent Wipes Table...');
    return (
        <div className="flex h-full w-full flex-grow overflow-hidden">
            <div className="flex w-full flex-col overflow-y-hidden">
                {server_list_table_header}
                {server_list_table_row_container}
            </div>
        </div>
    );
};

export default RecentWipesTable;
