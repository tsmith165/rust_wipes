const moment = require('moment');

function output_stats(startTime, endTime, serversParsed, serversSkipped, serversPosted, serverAttributeStats) {
    const duration = moment.duration(endTime.diff(startTime)); 
    const scraperDuration = `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
    console.log("----------------- SCRAPPER STATS -----------------");
    console.log(`Servers Parsed:  ${serversParsed}`);
    console.log(`Servers Skipped: ${serversSkipped}`);
    console.log(`Servers Posted:  ${serversPosted}`);
    console.log(`Scraper Duration: ${scraperDuration}`);
    console.log(`Server Attribute Stats (Next Line):\n${JSON.stringify(serverAttributeStats, null, 2)}`);
}

async function insert_scrapper_stats(prisma, startTime, endTime, serversParsed, serversSkipped, serversPosted) {
    const duration = moment.duration(endTime.diff(startTime));
    const scraperDurationInSeconds = duration.asSeconds();

    await prisma.scraper_stats.create({
        data: {
            scraper_duration: Math.floor(scraperDurationInSeconds),
            servers_parsed: serversParsed,
            servers_skipped: serversSkipped,
            servers_posted: serversPosted,
        }
    });
}

module.exports = {
    output_stats,
    insert_scrapper_stats
};