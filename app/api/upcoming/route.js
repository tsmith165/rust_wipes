import { prisma } from '../../../lib/prisma';

export async function POST(req) {
    console.log(`----- Start pull upcoming servers -----`);
    console.log(`req.method: ${req.method}`);

    const request = await req.json();
    console.log(request);

    if (request === undefined) {
        console.error(`Request body is undefined`);
        return false;
    }

    const date = new Date(request.date);
    const time_zone = parseInt(request.time_zone);
    const min_rank = parseInt(request.min_rank);
    const region = request.region;
    const resource_rate = request.resource_rate;
    const group_limit = request.group_limit;
    const game_mode = request.game_mode;

    const weekday = date.getDay();
    const day = date.getDate();
    const force_wipe = weekday == 4 && day < 7 ? true : false;

    //console.log(`Requesting data with params (Next Line):`);
    //console.log(`Server Rank: ${min_rank} | Weekday: ${weekday} | Day: ${day} | TZ: ${time_zone} | Force Wipe: ${force_wipe}`);
    //console.log(`Game Mode: ${game_mode} | Resource Rate: ${resource_rate} | Group Limit: ${group_limit}`);

    var search_params = null;
    if (force_wipe == true) {
        search_params = {
            region: region,
            force_wipe_hour: {
                not: {
                    equals: null,
                },
            },
            wipe_schedule: {
                not: {
                    equals: 'MONTHLY',
                },
            },
            rank: {
                lt: min_rank + 1,
            },
        };
    } else {
        search_params = {
            region: region,
            primary_day: parseInt(weekday) + 1,
            rank: {
                lt: min_rank + 1,
            },
        };
    }

    if (resource_rate != 'any' && resource_rate != null) {
        search_params.resource_rate = resource_rate;
    }
    if (group_limit != 'any' && group_limit != null) {
        search_params.group_limit = group_limit;
    }
    if (game_mode != 'any' && game_mode != null) {
        search_params.game_mode = game_mode;
    }

    var force_wipes = null;
    var primary_wipes = null;
    var secondary_wipes = null;
    var final_wipe_array = null;
    if (force_wipe == true) {
        force_wipes = await prisma.parsed_server.findMany({
            where: search_params,
            select: {
                id: true,
                title: true,
                rank: true,
                region: false,
                wipe_schedule: true,
                game_mode: true,
                resource_rate: true,
                force_hour: true,
                last_force: true,
                primary_day: false,
                primary_hour: false,
                last_primary: false,
                secondary_day: false,
                secondary_hour: false,
                last_secondary: false,
            },
            orderBy: [{ rank: 'asc' }],
        });
        final_wipe_array = force_wipes;
    } else {
        primary_wipes = await prisma.parsed_server.findMany({
            where: search_params,
            select: {
                id: true,
                title: true,
                rank: true,
                region: false,
                wipe_schedule: true,
                game_mode: true,
                resource_rate: true,
                force_hour: false,
                last_force: false,
                primary_day: true,
                primary_hour: true,
                last_primary: true,
                secondary_day: false,
                secondary_hour: false,
                last_secondary: false,
            },
            orderBy: [{ rank: 'asc' }],
        });
        secondary_wipes = await prisma.parsed_server.findMany({
            where: search_params,
            select: {
                id: true,
                title: true,
                rank: true,
                region: false,
                wipe_schedule: true,
                game_mode: true,
                resource_rate: true,
                force_hour: false,
                last_force: false,
                primary_day: false,
                primary_hour: false,
                last_primary: false,
                secondary_day: true,
                secondary_hour: true,
                last_secondary: true,
            },
            orderBy: [{ rank: 'asc' }],
        });

        // Combine primary / secondary wipes into one array
        final_wipe_array = primary_wipes;
        secondary_wipes.forEach((wipe) => {
            final_wipe_array.push(wipe);
        });
    }

    // Print found wipes and group wipes by wipe hour
    const debug = false;
    var grouped_wipe_dict = {};
    if (debug) {
        console.log(`Found wipes:`);
    }
    final_wipe_array.forEach((wipe) => {
        if (debug) {
            console.log(
                `ID: ${wipe.id} | Primary Wipe: ${wipe.primary_day}-${wipe.primary_hour} | Secondary Wipe: ${wipe.secondary_day}-${wipe.secondary_hour} | Force Wipe Hour: ${wipe.force_wipe_hour}`,
            );
        }
        //console.log(wipe.wipes)

        if (force_wipe) {
            const time_zoned_wipe_hour = Math.abs((parseInt(wipe.force_wipe_hour) + time_zone) % 24);
            // var last_wipe_date = get_latest_force_wipe(wipe.wipes);

            const wipe_data = {
                id: wipe.id,
                rank: wipe.rank,
                title: wipe.title,
                wipe_hour: time_zoned_wipe_hour,
                last_wipe_date: wipe.last_force,
            };
            if (grouped_wipe_dict[time_zoned_wipe_hour] == undefined) {
                grouped_wipe_dict[time_zoned_wipe_hour] = [wipe_data];
            } else {
                grouped_wipe_dict[time_zoned_wipe_hour].push(wipe_data);
            }
        } else {
            if (wipe.primary_day == weekday + 1) {
                const time_zoned_wipe_hour = Math.abs((parseInt(wipe.primary_hour) + time_zone) % 24);
                // var last_wipe_date = get_latest_weekday_wipe(wipe.wipes, wipe.primary_day);

                const wipe_data = {
                    id: wipe.id,
                    rank: wipe.rank,
                    title: wipe.title,
                    wipe_hour: time_zoned_wipe_hour,
                    last_wipe_date: wipe.last_primary,
                };
                if (grouped_wipe_dict[time_zoned_wipe_hour] == undefined) {
                    grouped_wipe_dict[time_zoned_wipe_hour] = [wipe_data];
                } else {
                    grouped_wipe_dict[time_zoned_wipe_hour].push(wipe_data);
                }
            } else if (wipe.secondary_day == weekday + 1) {
                const time_zoned_wipe_hour = Math.abs((parseInt(wipe.secondary_hour) + time_zone) % 24);
                // var last_wipe_date = get_latest_weekday_wipe(wipe.wipes, wipe.secondary_day);

                const wipe_data = {
                    id: wipe['id'],
                    rank: wipe['rank'],
                    title: wipe['title'],
                    wipe_hour: time_zoned_wipe_hour,
                    last_wipe_date: wipe.last_secondary,
                };
                if (grouped_wipe_dict[time_zoned_wipe_hour] == undefined) {
                    grouped_wipe_dict[time_zoned_wipe_hour] = [wipe_data];
                } else {
                    grouped_wipe_dict[time_zoned_wipe_hour].push(wipe_data);
                }
            }
        }
    });

    // console.log(`Upcoming Server Output (Next Line):`);
    // console.log(grouped_wipe_dict)
    return Response.json(grouped_wipe_dict, { status: 200 });
}

/*
function get_latest_force_wipe(wipe_date_array) {
    var last_wipe_date = null;
    wipe_date_array.forEach(wipe_date_str => {
        console.log(wipe_date_str)
        var wipe_date = new Date(wipe_date_str)
        if (wipe_date.getDay() == 4 && wipe_date.getDate() < 7) {
            last_wipe_date = wipe_date_str
            console.log(`Last Wipe Date: ${last_wipe_date}`)
            return last_wipe_date
        }
    });
    return last_wipe_date
}

function get_latest_weekday_wipe(wipe_date_array, wipe_weekday) {
    var last_wipe_date = null;
    wipe_date_array.forEach(wipe_date_str => {
        var wipe_date = new Date(wipe_date_str)
        if (wipe_date.getDay() == wipe_weekday) {
            last_wipe_date = wipe_date_str
            console.log(`Last Wipe Date: ${last_wipe_date}`)
            return last_wipe_date
        }
    });
    return last_wipe_date
}
*/
