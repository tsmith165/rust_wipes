import React from 'react';

import InputComponent from '@/components/InputComponent';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CachedIcon from '@material-ui/icons/Cached';

const RecentWipesSidebar = ({ state, update_filter_value, toggle_auto_refresh }) => {
    // Create Ad Block
    let filter_column_ad_container = null;
    if (state.render_ads) {
        filter_column_ad_container = (
            <div className={styles.filter_col_ad_container}>
                <div className={styles.filter_col_ad}>
                    <script
                        async
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564404116158956"
                        crossOrigin="anonymous"></script>
                    <ins
                        className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-7564404116158956"
                        data-ad-slot="7235036389"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
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
        <div className="bg-dark max-h-full" style={{ flex: '1 1 40%', minHeight: '20px' }}>
            <div className="flex flex-col">
                <div className="flex flex-wrap w-full">
                    <InputComponent
                        type={'input_split'}
                        default={2}
                        name={'Min Players'}
                        full_name={'Minimum Players'}
                        update_filter_value={update_filter_value}
                    />
                    <InputComponent
                        type={'input_split'}
                        default={5000}
                        name={'Max Dist'}
                        full_name={'Max Distance'}
                        update_filter_value={update_filter_value}
                    />
                </div>
                <div className="flex flex-row pb-2.5">
                    <InputComponent
                        type={'input'}
                        default={'US'}
                        name={'Country'}
                        update_filter_value={update_filter_value}
                    />
                    <div
                        className={`mt-2.5 mr-2.5 p-2.5 rounded-md ${
                            state.refreshing ? 'bg-primary' : 'bg-medium'
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            toggle_auto_refresh();
                        }}>
                        <CachedIcon className={`${state.refreshing ? 'animate-spin' : ''}`} />
                    </div>
                </div>
            </div>

            {filter_column_ad_container}
        </div>
    );
};

export default RecentWipesSidebar;
