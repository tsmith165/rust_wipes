import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function GET(req) {
  try {
    console.log(`Request URL: ${req.url}`);
    const server_id = req.url.split('/').pop();
    console.log(`/api/server/data - serverId: ${server_id}`)

    // Fetch data from Prisma
    const database_data = await prisma.server_parsed.findUnique({
        where: { id: Number(server_id) },
    });

    // Fetch data from BattleMetrics API
    const bm_server_data_api_call = `https://api.battlemetrics.com/servers/${server_id}`
    const bm_api_server_data = await axios.get(bm_server_data_api_call)

    // Define start and stop times for player count history
    // Example: Last 24 hours (You may adjust according to requirements)
    const stop = new Date().toISOString();
    const seven_day_start = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7)).toISOString();
    const one_day_start = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7)).toISOString();

    const bm_player_count_api_call = `https://api.battlemetrics.com/servers/${server_id}/player-count-history`
    console.log(`Fetching data from ${bm_player_count_api_call}`)
    
    // Send the start, stop, and optionally, the resolution parameters
    const bm_api_player_count_data = await axios.get(bm_player_count_api_call, {
      params: {
        start: seven_day_start,
        stop: stop,
        resolution: "30"  // Optional: you can adjust resolution as per requirements
      }
    });

    // console.log(`${bm_player_count_api_call} data:`, bm_api_player_count_data.data)

    /*
    const bm_player_list_api_call = `https://api.battlemetrics.com/players`
    console.log(`Fetching data from ${bm_player_list_api_call}`)
    
    // Send the start, stop, and optionally, the resolution parameters
    const bm_api_player_list_data = await axios.get(bm_player_count_api_call, {
      params: {
        filter: {
          servers: 12859681
        }
      }
    });

    console.log(`${bm_player_list_api_call} data:`, bm_api_player_list_data.data)
    */

    return Response.json({ 
      database_data: database_data, 
      bm_api_server_data: bm_api_server_data.data.data, 
      bm_api_player_count_data: bm_api_player_count_data.data,
      // bm_api_player_list_data: bm_api_player_list_data.data 
    }, { status: 200 });
  } catch(e) {
    console.log(`Error: ${e}`);
    return Response.json({ error: "Unable to fetch server data" }, { status: 500 });
  }
}
