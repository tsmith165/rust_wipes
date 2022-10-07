async function fetch_upcoming_servers_for_week_day(date, min_rank) {
    console.log(`Fetching upcoming servers for date: ${date} | min rank: ${min_rank}`)
    try {
        const response = await fetch(`/api/upcoming/servers`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            date: date,
            min_rank: min_rank
        })
    })

    const data = await response.json()

    console.log("Upcoming Servers data (Next Line):")
    console.log(data)
    return data

    } catch (error) {
        console.error("Fetching upcoming servers api call failure.  (Traceback next line)")
        console.log(error)

        return false
    }
}


export {
    fetch_upcoming_servers_for_week_day
}