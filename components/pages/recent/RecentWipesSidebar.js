import React from 'react';

import InputComponent from '@/components/InputComponent';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CachedIcon from '@material-ui/icons/Cached';

const RecentWipesSidebar = ({
    state,
    update_filter_value,
    toggle_auto_refresh,
}) => {
    // Create Ad Block
    let filter_column_ad_container = null;
    if (state.render_ads) {
        filter_column_ad_container = (
            <div className={styles.filter_col_ad_container}>
                <div className={styles.filter_col_ad}>
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
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>

                <div className={styles.filter_col_ad_blocked}>
                    <div className={styles.ad_blocked_container}>
                        <div className={styles.ad_blocked_message}>
                            Please Disable Ad-Block To Support The Developers
                        </div>
                        <ThumbUpIcon
                            className={`${styles.thumb_up_icon}`}
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-black max-h-full"
            style={{ flex: '1 1 40%', minHeight: '20px' }}
        >
            <div className="flex flex-col">
                <div className="py-1.5" />
                <div className="w-full px-3 space-x-3 flex flex-row ">
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
                <div className="flex flex-row px-3 space-x-3">
                    <InputComponent
                        type={'input'}
                        default={'US'}
                        name={'Country'}
                        update_filter_value={update_filter_value}
                    />
                    <div
                        className={`h-10 w-10 p-2 rounded-md ${
                            state.refreshing ? 'bg-light' : 'bg-dark'
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            toggle_auto_refresh();
                        }}
                    >
                        <CachedIcon
                            className={`${
                                state.refreshing ? 'animate-spin' : ''
                            }`}
                        />
                    </div>
                </div>
                <div className="py-1.5" />
            </div>

            {filter_column_ad_container}
        </div>
    );
};

export default RecentWipesSidebar;
