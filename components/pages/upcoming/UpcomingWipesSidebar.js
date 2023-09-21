import React from 'react';

import styles from '../../../styles/pages/UpcomingServerList.module.scss'
import InputComponent from '../../InputComponent';
  
class UpcomingWipesSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.update_filter_value = this.props.update_filter_value.bind(this);
    }

    render() {
    
        return (
            <div className={styles.server_list_filter_column}>

                {/* Filter Row 1 */}
                <div className={styles.input_container}>
                    {/* Date */}
                    <InputComponent type={'input_datepicker'} state={this.props.state} name={"Date"} update_filter_value={this.update_filter_value}/>

                    {/* Min Rank */}
                    <InputComponent type={'input_split'} default={5000} name={"Min Rank"} update_filter_value={this.update_filter_value}/>
                </div>

                {/* Filter Row 2 */}
                <div className={styles.input_container}>
                    {/* Time Zone */}
                    <InputComponent type={'input_select'} default={this.props.state.date} name={"Time"} update_filter_value={this.update_filter_value} select_options={[
                        [-10, 'Hawaii (UTC-10:00)'],
                        [-9, 'Alaska (UTC-09:00)'],
                        [-7, 'Pacific (UTC-07:00)'],
                        [-6, 'Mountain (UTC-06:00)'],
                        [-5, 'Central (UTC-05:00)'],
                        [-4, 'Eastern (UTC-04:00)'],
                        [-3, 'Atlantic (UTC-03:00)'],
                        [0, 'Coordinated Universal Time (UTC)'],
                        [1, 'UTC+1:00'],
                        [2, 'UTC+2:00'],
                        [3, 'UTC+3:00'],
                        [4, 'UTC+4:00'],
                        [5, 'UTC+5:00'],
                        [6, 'UTC+6:00'],
                        [7, 'UTC+7:00'],
                        [8, 'UTC+8:00'],
                        [9, 'UTC+9:00'],
                        [10, 'UTC+10:00'],
                        [11, 'UTC+11:00'],
                        [12, 'UTC+12:00'],
                        [13, 'UTC+13:00']
                    ]}/>


                    {/* Region */}
                    <InputComponent type={'input_select'} default={this.props.state.region} name={"Region"} update_filter_value={this.update_filter_value} select_options={[
                        ['US', 'US']
                    ]}/>
                </div>

                {/* Filter Row 3 */}
                <div className={styles.input_container}>
                    {/* Resource Rate */}
                    <InputComponent type={'input_select'} default={this.props.state.resource_rate} name={"Rate"} update_filter_value={this.update_filter_value} select_options={[
                        ['any', 'Any Resource Rate'],
                        ['1x', '1x'],
                        ['1.5x', '1.5x'],
                        ['2x', '2x'],
                        ['3x', '3x'],
                        ['5x', '5x'],
                        ['10x', '10x'],
                        ['100x', '100x'],
                        ['1000x', '1000x']
                    ]}/>

                    {/* Group Limit */}
                    <InputComponent type={'input_select'} default={this.props.state.group_limit} name={"Groups"} update_filter_value={this.update_filter_value} select_options={[
                        ['any', 'Any Group Limit'],
                        ['solo', 'Solo'],
                        ['duo', 'Duo'],
                        ['trio', 'Trio'],
                        ['quad', 'Quad'],
                        ['no limit', 'No Limit']
                    ]}/>
                </div>

                {/* Filter Row 4 */}
                <div className={styles.input_container}>
                    {/* Game Mode */}
                    <InputComponent type={'input_select'} default={this.props.state.game_mode} name={"Mode"} update_filter_value={this.update_filter_value} select_options={[
                        ['any', 'Any Game Mode'],
                        ['pvp', 'PvP'],
                        ['pve', 'PvE'],
                        ['arena', 'Arena'],
                        ['build', 'Build']
                    ]}/>
                    
                    {/* Wipe Day header */}
                    <div className={styles.input_split_container}>
                        <div className={styles.wipe_day_header}>
                            {this.props.state.wipe_day_header_str}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default UpcomingWipesSidebar;
