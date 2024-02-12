const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLastWipeField() {
    try {
        // Fetch all records from server_parsed
        const servers = await prisma.server_parsed.findMany();

        for (const server of servers) {
            let timestamps = [];

            if (server.last_primary) timestamps.push(new Date(server.last_primary));
            if (server.last_secondary) timestamps.push(new Date(server.last_secondary));
            if (server.last_force) timestamps.push(new Date(server.last_force));

            // Sort the timestamps to find the most recent
            timestamps.sort((a, b) => b - a);  // Sort in descending order

            if (timestamps.length > 0) {
                const mostRecentWipe = timestamps[0].toISOString();
                // Update the last_wipe field for the current server record
                await prisma.server_parsed.update({
                    where: { id: server.id },
                    data: { last_wipe: mostRecentWipe }
                });
                console.log(`Updated server ${server.id} with most recent wipe: ${mostRecentWipe}`);
            }
        }

    } catch (error) {
        console.error('Error updating last_wipe field:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateLastWipeField();
