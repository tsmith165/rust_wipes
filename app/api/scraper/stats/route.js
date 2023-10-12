import { prisma } from "../../../../lib/prisma";

export async function POST(req, res) {
    try {
        const { page = 1, itemsPerPage = 5 } = req.query;
        const skip = (page - 1) * itemsPerPage;

        const stats = await prisma.scraper_stats.findMany({
            orderBy: { date: "desc" },
            skip,
            take: itemsPerPage,
        });

        const totalStatsCount = await prisma.scraper_stats.count();

        const totalPages = Math.ceil(totalStatsCount / itemsPerPage);

        return Response.json({ stats, totalPages }, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'An error occurred.' }, { status: 500 });
    }
}
