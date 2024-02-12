import { prisma } from '@/lib/prisma';

export async function POST(req) {
    console.log(`----- Start pull scrapper stats data -----`);
    console.log(`req.method: ${req.method}`);

    const request = await req.json();
    console.log(request);

    if (request === undefined) {
        console.error(`Request body is undefined`);
        return false;
    }

    const page = parseInt(request.current_page) || 1;
    const items_per_page = parseInt(request.items_per_page) || 5;

    try {
        const skip = (page - 1) * items_per_page;

        const stats = await prisma.scrapper_stats.findMany({
            orderBy: { date: 'desc' },
            skip,
            take: items_per_page,
        });

        const totalStatsCount = await prisma.scrapper_stats.count();

        const totalPages = Math.ceil(totalStatsCount / items_per_page);

        return Response.json({ stats, totalPages }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'An error occurred.' }, { status: 500 });
    }
}
