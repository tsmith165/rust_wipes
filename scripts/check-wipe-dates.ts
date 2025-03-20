import { db } from '../src/db/db';
import { rw_parsed_server, next_wipe_info } from '../src/db/schema';

async function main() {
    try {
        // Check parsed servers for invalid dates
        console.log('Checking rw_parsed_server table for invalid wipe dates...');
        const parsedServers = await db.select().from(rw_parsed_server);

        let invalidLastWipeCount = 0;
        let invalidNextWipeCount = 0;
        let invalidNextFullWipeCount = 0;

        parsedServers.forEach((server) => {
            // Check last_wipe
            if (!server.last_wipe || isNaN(new Date(server.last_wipe).getTime())) {
                console.log(
                    `Server ID ${server.id}, Rank ${server.rank}, Title "${server.title}" has invalid last_wipe: ${server.last_wipe}`,
                );
                invalidLastWipeCount++;
            }

            // Check next_wipe
            if (!server.next_wipe || isNaN(new Date(server.next_wipe).getTime())) {
                console.log(
                    `Server ID ${server.id}, Rank ${server.rank}, Title "${server.title}" has invalid next_wipe: ${server.next_wipe}`,
                );
                invalidNextWipeCount++;
            }

            // Check next_full_wipe
            if (server.next_full_wipe && isNaN(new Date(server.next_full_wipe).getTime())) {
                console.log(
                    `Server ID ${server.id}, Rank ${server.rank}, Title "${server.title}" has invalid next_full_wipe: ${server.next_full_wipe}`,
                );
                invalidNextFullWipeCount++;
            }
        });

        console.log(`\nResults from rw_parsed_server table (${parsedServers.length} total servers):`);
        console.log(`- Invalid last_wipe dates: ${invalidLastWipeCount}`);
        console.log(`- Invalid next_wipe dates: ${invalidNextWipeCount}`);
        console.log(`- Invalid next_full_wipe dates: ${invalidNextFullWipeCount}`);

        // Check next_wipe_info table
        console.log('\nChecking next_wipe_info table for invalid wipe dates...');
        const wipeInfo = await db.select().from(next_wipe_info);

        let invalidLastWipeInfoCount = 0;
        let invalidLastRestartCount = 0;

        wipeInfo.forEach((info) => {
            // Check last_wipe
            if (info.last_wipe && isNaN(new Date(info.last_wipe).getTime())) {
                console.log(`Server ID ${info.server_id}, Name "${info.server_name}" has invalid last_wipe: ${info.last_wipe}`);
                invalidLastWipeInfoCount++;
            }

            // Check last_restart
            if (info.last_restart && isNaN(new Date(info.last_restart).getTime())) {
                console.log(`Server ID ${info.server_id}, Name "${info.server_name}" has invalid last_restart: ${info.last_restart}`);
                invalidLastRestartCount++;
            }
        });

        console.log(`\nResults from next_wipe_info table (${wipeInfo.length} total entries):`);
        console.log(`- Invalid last_wipe dates: ${invalidLastWipeInfoCount}`);
        console.log(`- Invalid last_restart dates: ${invalidLastRestartCount}`);
    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        process.exit(0);
    }
}

main();
