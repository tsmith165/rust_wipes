const server_addr = (process.env.NODE_ENV == 'development') ? 'http://localhost:3000' : '';
const website_addr = 'https://rustwipes.net'

async function fetch_upcoming_servers_for_week_day(date, time_zone, min_rank, absolute=False) {
    const final_server_addr = (absolute) ? website_addr : server_addr
    console.log(`Fetching upcoming servers for date: ${date} | min rank: ${min_rank}`)
    try {
        const response = await fetch(`${final_server_addr}/api/upcoming/servers/`, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                date: date,
                time_zone: time_zone,
                min_rank: min_rank
            })
        })

        const data = await response.json()

        //console.log("Upcoming Servers data (Next Line):")
        //console.log(data)
        return data

    } catch (error) {
        console.error("Fetching upcoming servers api call failure.  (Traceback next line)")
        console.log(error)

        return false
    }
}

async function fetch_battlemetrics_servers(country='US', max_distance=5000, min_players=2, num_servers=25, next_url='', prev_url='', use_default=true, forward=true) {
    var api_call = ``
    if (use_default) {
        api_call = `https://api.battlemetrics.com/servers?filter[game]=rust&filter[status]=online`
        api_call    += `&filter[countries][]=${country}&filter[maxDistance]=${max_distance}&filter[players][min]=${min_players}`
        api_call    += `&page[size]=${num_servers}&sort=-details.rust_last_wipe`
    }
    else {
        api_call = (forward) ? next_url : prev_url
    }

    console.log(`API CALL: ${api_call}`)

    const bm_response = await fetch(api_call)
    const bm_output = await bm_response.json()

    // console.log(`Fetch Output (Next Line):`);
    // console.log(bm_output)

    next_url = ('next' in bm_output['links']) ? bm_output['links']['next'] : 'none'
    prev_url = ('prev' in bm_output['links']) ? bm_output['links']['prev'] : 'none'

    return [bm_output['data'], next_url, prev_url]
}


export {
    fetch_upcoming_servers_for_week_day,
    fetch_battlemetrics_servers
}