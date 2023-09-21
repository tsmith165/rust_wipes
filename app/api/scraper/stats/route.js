import { prisma } from "../../../../lib/prisma";

export async function POST(req, res) {
    const { page = 1, itemsPerPage = 5 } = req.query;
    const skip = (page - 1) * itemsPerPage;

    const stats = await prisma.scraper_stats.findMany({
        orderBy: { date: "desc" },
        skip,
        take: itemsPerPage,
    });

    const totalStatsCount = await prisma.scraper_stats.count();

    const totalPages = Math.ceil(totalStatsCount / itemsPerPage);

    res.status(200).json({ stats, totalPages });
}