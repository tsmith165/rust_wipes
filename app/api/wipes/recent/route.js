// /app/api/wipes/recent/route.js
import { prisma } from '@/lib/prisma';

export async function GET(req) {
    try {
        console.log('Start recent_servers API Call: ', req.url);
        console.log('Start recent_servers qquery string: ', req.nextUrl.searchParams);

        // Parse query parameters for pagination. If they are not available, defaults are provided
        const page = req.nextUrl.searchParams.get('page') || 1;
        const items_per_page = req.nextUrl.searchParams.get('items_per_page') || 25;

        console.log(
            `Fetching recent servers for page ${page} with ${items_per_page} items per page`
        );

        // calculate offset based on page number
        const offset = (page - 1) * items_per_page;

        // Adjust the database query to use the limit and offset
        const recentServers = await prisma.server_parsed.findMany({
            orderBy: {
                last_wipe: 'desc',
            },
            skip: parseInt(offset), // use offset for pagination
            take: parseInt(items_per_page), // limit the number of items returned
        });

        // Optionally, also return the total count of servers to help with frontend pagination UI
        const totalServers = await prisma.server_parsed.count();

        return Response.json({ recentServers, totalServers });
    } catch (e) {
        console.log(`Error: ${e}`);
        return Response.json({ error: 'Unable to fetch recent servers' }, { status: 500 });
    } finally {
        console.log('End recent_servers API Call');
    }
}
