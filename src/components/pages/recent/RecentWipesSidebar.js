import React from 'react';

import styles from '../../../../styles/pages/RecentServerList.module.scss'

import InputContainer from '../../InputContainer';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

export default class RecentWipesSidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        {/* Create Ad Block*/}
        const filter_column_ad_container = null
        if (this.props.state.window_width >= 765 && this.props.state.render_ads == true) {
            const filter_column_ad_container = (
                <div className={styles.filter_col_ad_container}>           
                    <div className={styles.filter_col_ad}>
                        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564404116158956" crossOrigin="anonymous"></script>
                        <ins className="adsbygoogle"
                            style={{ display: "block"}}
                            data-ad-client="ca-pub-7564404116158956"
                            data-ad-slot="7235036389"
                            data-ad-format="auto"
                            data-full-width-responsive="true"> 
                        </ins>
                        <script> 
                            (adsbygoogle = window.adsbygoogle || []).push({}); 
                        </script>
                    </div>
                    
                    <div className={styles.filter_col_ad_blocked}>
                        <div className={styles.ad_blocked_container}>
                            <div className={styles.ad_blocked_message}>
                                Please Disable Ad-Block To Support The Developers
                            </div>
                            <ThumbUpIcon className={`${styles.thumb_up_icon}`} onClick={(e) => {e.preventDefault(); }}/>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.server_list_filter_column}>
                <div className={styles.input_container}>
                    {/* Min Player Count Textbox Input */}
                    <InputContainer type={'input_split'} default={2} name={"Min Players"} update_filter_value={this.props.update_filter_value}/>

                    {/* Max Server Distance  Textbox Input */}
                    <InputContainer type={'input_split'} default={5000} name={"Max Distance"} update_filter_value={this.props.update_filter_value}/>
                </div>

                {/* Country Select Input / Refresh Button */}
                <InputContainer type={'input_and_refresh'} default={'US'} name={"Country"} update_filter_value={this.props.update_filter_value} state={this.props.state} button_function={this.props.toggle_auto_refresh}/>

                {filter_column_ad_container}
            </div>  
        )
    }
}
