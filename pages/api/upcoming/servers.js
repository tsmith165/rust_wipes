import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
    console.log(`Start pull upcoming servers`);

    if(req.method !== 'POST') {
        // REQUEST METHOD NOT POST
        console.log("Request.method != POST.  Status: 402")
        res.status(402)
    } else {
        const date = new Date(req.body.date)
        const min_rank = parseInt(req.body.min_rank)
        
        const weekday = date.getDay()
        const day = date.getDay()
        const force_wipe = (weekday == 5 && day < 7) ? true : false

        console.log(`Server Rank: ${min_rank} | Weekday: ${weekday} | Day: ${day} | Force Wipe: ${force_wipe}`)

        var server_output = null;
        var final_wipe_array = [];
        if (force_wipe == true) {
            const force_wipes = await prisma.server.findMany({
                orderBy: [ {rank: 'asc'} ],
                where: {
                    force_wipe_hour: {
                        not: {
                            equals: null
                        }
                    }, rank: {
                        lt: (min_rank + 1)
                    }
                }
            })
            final_wipe_array = force_wipes
        } else {
            const primary_wipes = await prisma.server.findMany({
                orderBy: [ {rank: 'asc'} ],
                where: {
                    primary_day: parseInt(weekday), 
                    rank: {
                        lt: (min_rank + 1)
                    }
                }
            })
            const secondary_wipes = await prisma.server.findMany({
                orderBy: [ {rank: 'asc'} ],
                where: {
                    secondary_day: parseInt(weekday), 
                    rank: {
                        lt: (min_rank + 1)
                    }
                }
            })
            final_wipe_array = primary_wipes
            secondary_wipes.forEach(wipe => { final_wipe_array.push(wipe) })
        }

        // Print found wipes and group wipes by wipe hour
        var grouped_wipe_dict = {}
        console.log(`Found wipes:`)
        final_wipe_array.forEach(wipe => {
            console.log(`ID: ${wipe.id} | Primary Wipe: ${wipe.primary_day}-${wipe.primary_hour} | Secondary Wipe: ${wipe.secondary_day}-${wipe.secondary_hour} | Force Wipe Hour: ${wipe.force_wipe_hour}`)
            if (force_wipe) {
                const wipe_data = {
                    id: wipe['id'],
                    rank: wipe['rank'],
                    title: wipe['title'],
                    wipe_hour: wipe['force_wipe_hour']
                }
                if (grouped_wipe_dict[wipe['force_wipe_hour']] == undefined) { 
                    grouped_wipe_dict[wipe['force_wipe_hour']] = [wipe_data]
                } else {
                    grouped_wipe_dict[wipe['force_wipe_hour']].push(wipe_data)
                }
            } else {
                if (wipe.primary_day == weekday) {
                    const wipe_data = {
                        id: wipe['id'],
                        rank: wipe['rank'],
                        title: wipe['title'],
                        wipe_hour: wipe['primary_hour']
                    }
                    if (grouped_wipe_dict[wipe['primary_hour']] == undefined) { 
                        grouped_wipe_dict[wipe['primary_hour']] = [wipe_data]
                    } else {
                        grouped_wipe_dict[wipe['primary_hour']].push(wipe_data)
                    }
                } 
                else if (wipe.secondary_day == weekday) {
                    const wipe_data = {
                        id: wipe['id'],
                        rank: wipe['rank'],
                        title: wipe['title'],
                        wipe_hour: wipe['secondary_hour']
                    }
                    if (grouped_wipe_dict[wipe['secondary_hour']] == undefined) { 
                        grouped_wipe_dict[wipe['secondary_hour']] = [wipe_data]
                    } else {
                        grouped_wipe_dict[wipe['secondary_hour']].push(wipe_data)
                    }
                }
            }
        });

        console.log(`Upcoming Server Output (Next Line):`);
        console.log(grouped_wipe_dict)
        res.json(grouped_wipe_dict)
    }

    res.end()
}
