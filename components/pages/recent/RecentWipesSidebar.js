import React from 'react';
import PropTypes from 'prop-types';

import InputComponent from '@/components/InputComponent';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CachedIcon from '@material-ui/icons/Cached';

const RENDER_ADS = false;

const RecentWipesSidebar = ({ state, update_filter_value, toggle_auto_refresh }) => {
    let filter_column_ad_container = null;
    if (RENDER_ADS) {
        filter_column_ad_container = (
            <div className={'h-full w-full'}>
                <div className={'p-2.5'}>
                    <script
                        async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564404116158956"
                        crossOrigin="anonymous"
                    ></script>
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-7564404116158956"
                        data-ad-slot="7235036389"
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    ></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                </div>

                <div className={'flex h-full w-full space-x-2 bg-grey p-2.5'}>
                    <div className={'styles.ad_blocked_message'}>Please Disable Ad-Block To Support The Developers</div>
                    <ThumbUpIcon
                        className={'h-10 w-10 rounded-md bg-light p-2'}
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    />
                </div>
            </div>
        );
    }
    return (
        <div className="max-h-full bg-black" style={{ flex: '1 1 40%', minHeight: '20px' }}>
            <div className="flex flex-col">
                <div className="py-1.5" />
                <div className="flex w-full flex-row space-x-3 px-3 ">
                    <InputComponent
                        type={'input'}
                        default={2}
                        name={'Min Players'}
                        full_name={'Minimum Players'}
                        update_filter_value={update_filter_value}
                    />
                    <InputComponent
                        type={'input'}
                        default={5000}
                        name={'Max Dist'}
                        full_name={'Max Distance'}
                        update_filter_value={update_filter_value}
                    />
                </div>
                <div className="py-1.5" />
                <div className="flex flex-row space-x-3 px-3">
                    <InputComponent type={'input'} default={'US'} name={'Country'} update_filter_value={update_filter_value} />
                    <div
                        className={`h-10 w-10 rounded-md p-2 ${state.refreshing ? 'bg-light' : 'bg-dark'}`}
                        onClick={(e) => {
                            e.preventDefault();
                            toggle_auto_refresh();
                        }}
                    >
                        <CachedIcon className={`${state.refreshing ? 'animate-spin' : ''}`} />
                    </div>
                </div>
                <div className="py-1.5" />
            </div>

            {filter_column_ad_container}
        </div>
    );
};

export default RecentWipesSidebar;

RecentWipesSidebar.propTypes = {
    state: PropTypes.object,
    update_filter_value: PropTypes.func,
    toggle_auto_refresh: PropTypes.func,
};
