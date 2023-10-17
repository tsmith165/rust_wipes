// /app/api/server/networks/route.js
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    try {
        console.log('Start server_networks API Call: ', req.url);
        const networks = await prisma.server_network.findMany({
            where: { region: 'US' },
        });

        console.log('Networks data (Next Line):');
        console.log(networks);

        // FETCH DATA FOR ALL BM IDS FOR EACH NETWORK HERE
        const detailedNetworks = await Promise.all(
            networks.map(async (network) => {
                const bm_ids_array = network.bm_ids.split(',').map((item) => item.trim());
                const servers = await prisma.server_parsed.findMany({
                    where: {
                        id: {
                            in: bm_ids_array.map(Number),
                        },
                    },
                });

                // Add the servers' data to the network object
                return {
                    ...network,
                    servers,
                };
            })
        );

        return Response.json({ networks: detailedNetworks }, { status: 200 });
    } catch (error) {
        console.error('Error during server networks fetch: ', error);
        return Response.json({ error: 'An error occurred.' }, { status: 500 });
    }
}
