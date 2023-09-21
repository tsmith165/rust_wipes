const moment = require('moment');

function output_stats(start_time, end_time, servers_parsed, servers_skipped, servers_posted, server_attribute_stats) {
    const duration = moment.duration(end_time.diff(start_time)); 
    const scraper_duration = `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
    console.log("----------------- SCRAPPER STATS -----------------");
    console.log(`Servers Parsed:  ${servers_parsed}`);
    console.log(`Servers Skipped: ${servers_skipped}`);
    console.log(`Servers Posted:  ${servers_posted}`);
    console.log(`Scraper Duration: ${scraper_duration}`);
    console.log(`Server Attribute Stats (Next Line):\n${JSON.stringify(server_attribute_stats, null, 2)}`);
}

async function insert_scrapper_stats(prisma, start_time, end_time, servers_parsed, servers_skipped, servers_posted) {
    const duration = moment.duration(end_time.diff(start_time));
    const scraper_dration_seconds = duration.asSeconds();

    await prisma.scraper_stats.create({
        data: {
            scraper_duration: Math.floor(scraper_dration_seconds),
            servers_parsed: servers_parsed,
            servers_skipped: servers_skipped,
            servers_posted: servers_posted,
        }
    });
}

module.exports = {
    output_stats,
    insert_scrapper_stats
};