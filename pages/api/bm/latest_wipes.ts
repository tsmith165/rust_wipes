import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'FETCH') {
        console.log("Request.method != FETCH.  Status: 402")
        res.status(402)
    } else {
        console.log(`Attempting to capture BattleMetrics API data...`)

        const bm_response = await fetch('https://api.battlemetrics.com/servers?filter[game]=rust&filter[status]=online&filter[countries][]=US&filter[maxDistance]=5000&filter[players][min]=2&sort=-details.rust_last_wipe&page[size]=100')
        const bm_output = await bm_response.json()

        console.log(`Update Output (Next Line):`);
        console.log(bm_output)
        res.json(bm_output)
    }
    res.end()
}
