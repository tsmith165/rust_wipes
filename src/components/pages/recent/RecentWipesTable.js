import styles from '../../../../styles/pages/RecentServerList.module.scss'

import RecentServerRow from './RecentServerRow';

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

const RecentWipesTable = ({state}) => {

    {/* Create Server List */}
    var servers_jsx_array = [];
    if (state.server_list != undefined) {
        var server_list_length = state.server_list.length;

        if (state.debug) console.log(`SERVER LIST LENGTH: ${server_list_length}`)
        console.log(state.server_list)

        for (var i = 0; i < server_list_length; i++) {
            var current_server_json = state.server_list[i];

            var id          = current_server_json['id'];
            var ip          = current_server_json['attributes']['ip'];
            var port        = current_server_json['attributes']['port'];
            var name        = current_server_json['attributes']['name'];
            var rank        = current_server_json['attributes']['rank'];
            var players     = current_server_json['attributes']['players'];
            var max_players = current_server_json['attributes']['maxPlayers'];
            var wipe_date   = current_server_json['attributes']['details']['rust_last_wipe'];

            if (state.debug) {
                console.log(`Server ID: ${id} | Name: ${name} | Rank: ${rank}`)
                console.log(`Wipe Date: ${wipe_date}`)
                console.log(`Players: ${players} | Max Players: ${max_players}`)
                console.log('--------------------------------------------------------------------');
            }

            servers_jsx_array.push(
                <RecentServerRow
                    key={i}
                    ip={`${ip}:${port}`}
                    id={`server-${i}`}
                    className={name}
                    url={`https://www.battlemetrics.com/servers/rust/${id}`}
                    rank={rank}
                    players={players}
                    max_players={max_players}
                    wipe_date={wipe_date}
                />
            );
        }
    }

    return (
        (state.server_list == null) ? (
            <div className={styles.server_list_body_container}>
                <div className={styles.loader}/>
            </div>
        ) : (
            <div className={styles.server_list_body_container}>
                <div className={`${styles.server_header_container} ${styles.old_wipe}`}>
                    <div className={`${styles.rank_cell} ${styles.server_list_header}`}>
                        {'Rank'}
                    </div>
                    <div className={`${styles.server_name_cell} ${styles.server_list_header}`}>
                        {'Server Title'}
                    </div>
                    <div className={`${styles.player_count_cell} ${styles.server_list_header}`}>
                        {'Players'}
                    </div>
                    <div className={`${styles.timestamp_cell} ${styles.server_list_header}`}>
                        {'Wiped'}
                    </div>
                    <div className={`${styles.copy_cell} ${styles.server_list_header}`}>
                        {'Copy'}
                    </div>
                </div>
                <div className={styles.server_list_body}>
                    <div className={styles.server_list_table}>
                        {/* Insert Server List Table */}
                        {servers_jsx_array}
                    </div>
                </div>
                <div className={styles.server_list_page_filter_container}>
                    <div className={styles.page_selector_container}>
                        <div className={styles.page_selector}>
                            <ArrowForwardIosRoundedIcon className={`${styles.page_arrow_icon} ${styles.img_hor_vert}`} onClick={(e) => {e.preventDefault(); this.switch_page(false)}}/>
                            {state.current_page}
                            <ArrowForwardIosRoundedIcon className={`${styles.page_arrow_icon}`} onClick={(e) => {e.preventDefault(); this.switch_page(true)}}/>
                        </div>
                    </div>
                    <div className={styles.page_selector_container}>
                        <div className={styles.page_selector}>
                            <select 
                                id="num_servers" 
                                className={`${styles.num_servers}`} 
                                defaultValue={25}
                                onChange={(e) => {
                                    e.preventDefault();
                                    const num_servers = document.getElementById('num_servers').value; 
                                    console.log(`NEW NUM SERVERS: ${num_servers}`); 
                                    this.setState({num_servers: num_servers})
                                }}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

export default RecentWipesTable;
