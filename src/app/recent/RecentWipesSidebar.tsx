import React from 'react';
import queryString from 'query-string';
import InputTextbox from '@/components/inputs/InputTextbox';
import { FaRegThumbsUp } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';

const RENDER_ADS = false;

interface RecentWipesSidebarProps {
    searchParams?: {
        [key: string]: string | string[] | undefined;
    };
}

const RecentWipesSidebar: React.FC<RecentWipesSidebarProps> = ({ searchParams }) => {
    let filterColumnAdContainer = null;
    if (RENDER_ADS) {
        filterColumnAdContainer = (
            <div className={'h-full w-full'}>
                <div className={'p-2.5'}>{/* Ad script and elements */}</div>
                <div className={'flex h-full w-full space-x-2 bg-secondary p-2.5'}>
                    <div className={'styles.ad_blocked_message'}>Please Disable Ad-Block To Support The Developers</div>
                    <FaRegThumbsUp className={'h-10 w-10 rounded-md bg-primary_light p-2'} />
                </div>
            </div>
        );
    }

    const page = parseInt((searchParams?.page as string) || '1');
    const numServers = parseInt((searchParams?.numServers as string) || '25');
    const minPlayers = parseInt((searchParams?.minPlayers as string) || '2');
    const maxDist = parseInt((searchParams?.maxDist as string) || '5000');
    const country = (searchParams?.country as string) || 'NA';

    // Construct the base URL
    const base_url = '/recent';

    // Construct the query string from the current search parameters
    const current_query_string = queryString.stringify({
        page,
        numServers,
        minPlayers,
        maxDist,
        country,
    });

    const form_action_url = `${base_url}?${current_query_string}`;
    console.log('Using following form_action_url for updating query string: ' + form_action_url);

    return (
        <div className="max-h-full bg-secondary" style={{ flex: '1 1 35%', minHeight: '20px' }}>
            <form method="GET" action={form_action_url}>
                <div className="flex flex-col space-y-2 p-2">
                    <div className="flex w-full flex-row space-x-2 ">
                        <InputTextbox idName="minPlayers" name="minPlayers" value={minPlayers.toString()} placeholder="Min Players" />
                        <InputTextbox idName="maxDist" name="maxDist" value={maxDist.toString()} placeholder="Max Dist" />
                    </div>
                    <div className="flex flex-row space-x-2">
                        <InputTextbox idName="country" name="country" value={country} placeholder="Country" />
                        <button type="submit" className={`h-8 w-8 rounded-md bg-primary p-1.5 hover:bg-primary_dark`}>
                            <HiRefresh className={`hover:animate-spin`} />
                        </button>
                    </div>
                    <input type="hidden" name="page" value={page} />
                    <input type="hidden" name="numServers" value={numServers} />
                </div>
            </form>

            {filterColumnAdContainer}
        </div>
    );
};

export default RecentWipesSidebar;
