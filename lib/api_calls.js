import axios from 'axios';
import queryString from 'query-string';

function generateServer(id) {
    return {
        id: id,
        attributes: {
            ip: `192.168.1.${id}`,
            port: 28015 + id,
            name: `Test Server ${id}`,
            rank: id,
            players: Math.floor(Math.random() * 100),
            maxPlayers: 100,
            details: {
                rust_last_wipe: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
            },
        },
    };
}

function generate_test_battlemetrics_data() {
    if (mockData.length === 0) {
        for (let i = 1; i <= 24; i++) {
            // Initialize with 24 servers
            mockData.push(generateServer(i));
        }
    }

    // Add a new server to the mock data
    const newServerId = mockData.length + 1;
    mockData.push(generateServer(newServerId));

    return [mockData, 'next_url_mock', 'prev_url_mock', 0];
}

async function fetch_upcoming_servers_for_week_day(
    date,
    time_zone,
    min_rank,
    region,
    resource_rate,
    group_limit,
    game_mode,
    absolute = false,
) {
    const final_server_addr = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    console.log(`Fetching upcoming servers for date: ${date} | min rank: ${min_rank}`);
    try {
        const response = await axios.post(`${final_server_addr}/api/upcoming/`, {
            date: date,
            time_zone: time_zone,
            min_rank: min_rank,
            region: region,
            resource_rate: resource_rate,
            group_limit: group_limit,
            game_mode: game_mode,
        });

        const data = response.data;

        //console.log("Upcoming Servers data (Next Line):")
        //console.log(data)
        return data;
    } catch (error) {
        console.error('Fetching upcoming servers api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

async function fetch_scrapper_stats_data(current_page = 1, items_per_page = 5) {
    const final_server_addr = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    try {
        const response = await axios.post(`${final_server_addr}/api/scrapper/stats`, {
            current_page: current_page,
            items_per_page: items_per_page,
        });

        const data = response.data;

        console.log('Scrapper Stats data (Next Line):');
        console.log(data);
        return data;
    } catch (error) {
        console.error('Scrapper stats api call failure.  (Traceback next line)');
        console.log(error);

        return false;
    }
}

/**
 * Fetches server information from BattleMetrics with pagination support.
 *
 * @param {string} country - The country to filter the servers by.
 * @param {number} max_distance - Maximum distance for the server.
 * @param {number} min_players - Minimum players present in the server.
 * @param {number} num_servers - Number of servers to retrieve per page.
 * @param {string} next_url - The next URL to paginate forward.
 * @param {string} prev_url - The previous URL to paginate backward.
 * @param {boolean} use_default - Whether to use default parameters for the API call.
 * @param {number} page - The page number to fetch (used for pagination).
 * @returns {Promise<Array>} - A promise that resolves with the server data and pagination URLs.
 */
async function fetch_battlemetrics_servers(
    country = 'US',
    max_distance = 5000,
    min_players = 2,
    num_servers = 25,
    next_url = '',
    prev_url = '',
    use_default = true,
    forward = true,
    page = 1, // new parameter for specifying the page number
) {
    // If using default params, construct the URL with query parameters, including the page number
    if (use_default) {
        const offset = (page - 1) * num_servers;

        const queryParams = {
            'filter[game]': 'rust',
            'filter[status]': 'online',
            'filter[countries][]': country,
            'filter[maxDistance]': max_distance,
            'filter[players][min]': min_players,
            'page[size]': num_servers,
            sort: '-details.rust_last_wipe',
            'page[offset]': offset, // include the page number here
        };

        // Build the URL with the query parameters
        const api_call = `https://api.battlemetrics.com/servers?${queryString.stringify(queryParams)}`;
        console.log(`API CALL: ${api_call}`);

        try {
            const bm_response = await axios.get(api_call); // using axios for the request
            const bm_output = bm_response.data;

            next_url = bm_output.links.next || 'none';
            prev_url = bm_output.links.prev || 'none';

            console.log('BM API Output:', bm_output.data);

            return [bm_output.data, next_url, prev_url];
        } catch (error) {
            console.error('Error fetching data from BattleMetrics', error);
            return [null, 'none', 'none']; // or handle failure as you see fit
        }
    } else {
        api_call = forward ? next_url : prev_url;
    }

    console.log(`API CALL: ${api_call}`);

    const bm_response = await fetch(api_call);
    const bm_output = await bm_response.json();

    // console.log(`Fetch Output (Next Line):`);
    // console.log(bm_output)

    next_url = 'next' in bm_output['links'] ? bm_output['links']['next'] : 'none';
    prev_url = 'prev' in bm_output['links'] ? bm_output['links']['prev'] : 'none';

    return [bm_output['data'], next_url, prev_url];
}

async function fetch_recent_wipes_from_db(page = 1, items_per_page = 25) {
    const final_server_addr = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    // Include query parameters in the URL
    const api_call_url = `${final_server_addr}/api/wipes/recent?page=${page}&items_per_page=${items_per_page}`;

    console.log('Attempting to fetch: ' + api_call_url);
    try {
        const response = await axios.get(api_call_url); // Axios will send request with parameters
        const data = response.data;

        console.log('Recent Wipes data (Next Line):');
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error in fetching recent wipes from DB. (Traceback next line)');
        console.log(error);

        return [];
    }
}

async function fetch_server_data_by_bm_id(server_id) {
    const final_server_addr = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    const api_call_url = `${final_server_addr}/api/server/data/${server_id}`;
    console.log(`API CALL: ${api_call_url}`);
    const api_response = await axios.get(api_call_url);
    const api_data = api_response.data;
    console.log(`/api/server/data/${server_id} Fetch Output:`, api_data);
    return api_data;
}

async function fetch_server_networks_data() {
    const final_server_addr = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    const api_call_url = `${final_server_addr}/api/server/networks`;

    console.log('Attempting to fetch server networks: ' + api_call_url);

    try {
        const response = await axios.get(api_call_url);

        const serverNetworksData = response.data;

        console.log('Server Networks data (Next Line):');
        console.log(serverNetworksData);
        return serverNetworksData;
    } catch (error) {
        console.error('Error in fetching server networks data. (Traceback next line)');
        console.log(error);

        return [];
    }
}

export {
    fetch_upcoming_servers_for_week_day,
    fetch_battlemetrics_servers,
    generate_test_battlemetrics_data,
    fetch_recent_wipes_from_db,
    fetch_server_data_by_bm_id,
    fetch_scrapper_stats_data,
    fetch_server_networks_data,
};
