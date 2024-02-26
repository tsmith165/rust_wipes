// Import necessary libraries and dependencies
import { prisma } from '@/lib/prisma'; // Adjust the import path as necessary
import Link from 'next/link';

// Define the page component
export default async function NetworksPage() {
    console.log('Fetching server networks data...');
    const networks = await prisma.server_network.findMany({
        where: { region: 'US' },
    });

    // Initialize the servers array for each network
    networks.forEach((network) => (network.servers = []));

    console.log('Fetching server data for each network...');
    for (const network of networks) {
        for (var bm_id of network.bm_ids.split(', ')) {
            const server = await prisma.server_parsed.findFirst({
                where: { id: parseInt(bm_id) },
            });
            if (server) {
                network.servers.push(server);
            }
        }
    }

    console.log('Rendering network cards...');
    return (
        <div className="flex h-full w-full flex-row overflow-x-auto bg-dark">
            {networks.map((network) => (
                <div key={network.id} className="h-max max-h-full w-fit max-w-md flex-shrink-0 overflow-y-auto p-2">
                    <div className="flex h-full flex-col rounded-lg bg-black">
                        <h3 className="p-4 font-bold text-primary">{network.name}</h3>
                        <div className="flex-1 bg-secondary last:rounded-b-lg">
                            {network.servers.map((server) => (
                                <div key={server.id} className="truncate px-2.5 py-1 text-grey hover:bg-light hover:text-black">
                                    <Link href={`/server/${server.id}`}>{server.title}</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
