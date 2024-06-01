import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import InputComponent from '../../InputComponent';
import { FaRegThumbsUp } from 'react-icons/fa';
import { HiRefresh } from 'react-icons/hi';

const RENDER_ADS = false;

const RecentWipesSidebar = ({ searchParams }) => {
    let filterColumnAdContainer = null;
    if (RENDER_ADS) {
        filterColumnAdContainer = (
            <div className={'h-full w-full'}>
                <div className={'p-2.5'}>{/* Ad script and elements */}</div>
                <div className={'flex h-full w-full space-x-2 bg-secondary p-2.5'}>
                    <div className={'styles.ad_blocked_message'}>Please Disable Ad-Block To Support The Developers</div>
                    <FaRegThumbsUp className={'bg-primary_light h-10 w-10 rounded-md p-2'} />
                </div>
            </div>
        );
    }

    // console.log('Recent Wipes Sidebar Search Params: ', searchParams);

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

    return (
        <div className="bg-secondary_dark max-h-full" style={{ flex: '1 1 35%', minHeight: '20px' }}>
            <form method="GET" action={form_action_url}>
                <div className="flex flex-col">
                    <div className="py-1.5" />
                    <div className="flex w-full flex-row space-x-3 px-3 ">
                        <InputComponent
                            type={'input'}
                            defaultValue={minPlayers}
                            param_name={'minPlayers'}
                            param_full_name={'Min Players'}
                            searchParams={searchParams}
                        />
                        <InputComponent
                            type={'input'}
                            defaultValue={maxDist}
                            param_name={'maxDist'}
                            param_full_name={'Max Dist'}
                            searchParams={searchParams}
                        />
                    </div>
                    <div className="py-1.5" />
                    <div className="flex flex-row space-x-3 px-3">
                        <InputComponent
                            type={'input'}
                            defaultValue={country}
                            param_name={'country'}
                            param_full_name={'Country'}
                            searchParams={searchParams}
                        />
                        <button type="submit" className={`h-8 w-8 rounded-md bg-secondary p-1.5 hover:bg-primary`}>
                            <HiRefresh className={`hover:animate-spin`} />
                        </button>
                    </div>
                    <div className="py-1.5" />
                    <input type="hidden" name="page" value={page} />
                    <input type="hidden" name="numServers" value={numServers} />
                </div>
            </form>

            {filterColumnAdContainer}
        </div>
    );
};

export default RecentWipesSidebar;

RecentWipesSidebar.propTypes = {
    searchParams: PropTypes.object,
};
