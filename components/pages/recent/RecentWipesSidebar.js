import React from 'react';
import PropTypes from 'prop-types';

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
                <div className={'flex h-full w-full space-x-2 bg-dark p-2.5'}>
                    <div className={'styles.ad_blocked_message'}>Please Disable Ad-Block To Support The Developers</div>
                    <FaRegThumbsUp className={'h-10 w-10 rounded-md bg-light p-2'} />
                </div>
            </div>
        );
    }

    // Note: The form submission approach for updating filters is a simplification.
    // You might need a different approach based on your application's architecture.
    return (
        <div className="max-h-full bg-black" style={{ flex: '1 1 40%', minHeight: '20px' }}>
            <form
                method="GET"
                action={`/recent?page=${parseInt(searchParams.page)}&minPlayers=${parseInt(searchParams.minPlayers)}&maxDist=${parseInt(searchParams.maxDist)}&country=${searchParams.country}`}
            >
                <div className="flex flex-col">
                    <div className="py-1.5" />
                    <div className="flex w-full flex-row space-x-3 px-3 ">
                        <InputComponent
                            type={'input'}
                            defaultValue={2}
                            param_name={'minPlayers'}
                            param_full_name={'Minimum Players'}
                            searchParams={searchParams}
                        />
                        <InputComponent
                            type={'input'}
                            defaultValue={5000}
                            param_name={'maxDist'}
                            param_full_name={'Max Distance'}
                            searchParams={searchParams}
                        />
                    </div>
                    <div className="py-1.5" />
                    <div className="flex flex-row space-x-3 px-3">
                        <InputComponent type={'input'} defaultValue={'US'} param_name={'country'} searchParams={searchParams} />
                        <button type="submit" className={`h-10 w-10 rounded-md bg-dark p-2 hover:bg-primary`}>
                            <HiRefresh className={`hover:animate-spin`} />
                        </button>
                    </div>
                    <div className="py-1.5" />
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
