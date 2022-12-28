import React from 'react';

import styles from '../../../../styles/pages/RecentServerList.module.scss';

import { fetch_battlemetrics_servers } from '../../../../lib/api_calls';
import RecentWipesSidebar from './RecentWipesSidebar';
import RecentWipesTable from './RecentWipesTable';

class RecentWipesPage extends React.Component {
    constructor(props) {
        super(props);

        // Don't call this.setState() here!
        this.state = {
            debug: false,
            running: false,
            refreshing: false,
            server_list: null,
            next_url: props.next_url,
            prev_url: props.prev_url,
            server_list_timer: null,
            num_servers: 25,
            min_players: 2,
            max_distance: 5000,
            country: 'US',
            current_page: 1,
            window_width: null,
            render_ads: false
        };

        this.handle_window_resize = this.handle_window_resize.bind(this);
        this.fetch_servers = this.fetch_servers.bind(this);
        this.update_server_list = this.update_server_list.bind(this);
        this.update_filter_value = this.update_filter_value.bind(this);
        this.toggle_auto_refresh = this.toggle_auto_refresh.bind(this);
    }

    async componentDidMount() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const [new_server_list, next_url, prev_url] = await this.fetch_servers()
        // this.set_server_list_fetch_timeout()  // disabled as we added button to turn on interval

        // Add event listener
        window.addEventListener("resize", this.handle_window_resize);

        this.handle_window_resize()

        this.setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url})
    }

    async update_filter_value(filter, new_value) {
        console.log(`Setting state on filter: ${filter} | Value: ${new_value}`)
        if      (filter == 'max_distance') { this.setState({max_distance: new_value}, async () => {(this.state.running == false) ? (await this.props.update_server_list() ) : (null) }) }
        else if (filter == 'num_servers')  { this.setState({num_servers: new_value},  async () => {(this.state.running == false) ? (await this.props.update_server_list() ) : (null) }) }
        else if (filter == 'min_players')  { this.setState({min_players: new_value},  async () => {(this.state.running == false) ? (await this.props.update_server_list() ) : (null) }) }
        else if (filter == 'country')      { this.setState({country: new_value},      async () => {(this.state.running == false) ? (await this.props.update_server_list() ) : (null) }) }
    }

    handle_window_resize() {
        this.setState({
            window_width: window.innerWidth
        });
    }
    
    reset_timer() {
        clearTimeout(this.state.server_list_timer)
        this.set_server_list_fetch_timeout()
    }
      
    set_server_list_fetch_timeout() {
        console.log(`Server List Update Timer Running: ${this.state.running}`)
        if (this.state.running) {
            var server_list_timer = setTimeout(async () => {
                this.setState({server_list_timer: server_list_timer, refreshing: true})
                await this.update_server_list()
            }, 5 * 1000)
        }
    }

    async switch_page(forward) {
        const [new_server_list, next_url, prev_url] = await this.fetch_servers(false, forward)
        console.log(`New Server List (Next Line): `)
        console.log(new_server_list);

        if (forward == true && next_url != 'none') {
            this.setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_page: this.state.current_page + 1})
        }
        else if (forward == false && prev_url != 'none') {
            this.setState({server_list: new_server_list, next_url: next_url, prev_url: prev_url, current_page: this.state.current_page - 1})
        }
    }

    async run_refresh_timer(post_refresh_state, wait_time) {
        console.log(`Refreshing for set ${wait_time / 1000}s before updating data to state`)
        const refresh_timer = setTimeout(() => {
            this.setState(post_refresh_state)
            clearTimeout(refresh_timer)
        }, wait_time);
    }

    async toggle_auto_refresh() {
        console.log(`Toggling auto-refresh state - current: ${this.state.running}`);
        if (this.state.running == true) {
            console.log("Toggling OFF auto-refresh")
            if (this.state.server_list_timer != null) { clearTimeout(this.state.server_list_timer) }
            this.setState({running: false});
        // If currently NOT running
        } else {
            console.log("Toggling ON auto-refresh")
            this.setState({refreshing: true, running: true})

            await this.update_server_list()
        }
    }

    async update_server_list() {
        console.log(`-------------- Updating Server List --------------`)
        const [new_server_list, next_url, prev_url] = await this.fetch_servers()
        console.log(`New Server List (Next Line): `)
        console.log(new_server_list);

        const post_refresh_state = {server_list: new_server_list, next_url: next_url, prev_url: prev_url, refreshing: false}
        this.run_refresh_timer(post_refresh_state, 1500)

        clearTimeout(this.state.server_list_timer)
        this.set_server_list_fetch_timeout()
    } 

    async fetch_servers(use_default=true, forward=true) {
        const [new_server_list, next_url, prev_url] = await fetch_battlemetrics_servers(
            this.state.country, 
            this.state.max_distance, 
            this.state.min_players, 
            this.state.num_servers, 
            this.state.next_url, 
            this.state.prev_url,
            use_default, 
            forward
        )
        return [new_server_list, next_url, prev_url]
    }

    render() {
        return (
            <div className={styles.page_container}>
                <div className={styles.server_list_container}>
                    <RecentWipesSidebar state={this.state} toggle_auto_refresh={this.toggle_auto_refresh} update_filter_value={this.update_filter_value}/>
                    <RecentWipesTable state={this.state}/>
                </div>
            </div>
        )
    }
}

export default RecentWipesPage;
