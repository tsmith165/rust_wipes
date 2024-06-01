import React from 'react';
import { rw_scrapper_stats } from '@/db/schema';
import { db } from '@/db/db';
import { desc } from 'drizzle-orm';
import { count } from 'drizzle-orm/sql';
import Link from 'next/link';

interface ScrapperStats {
    id: number;
    date: Date | null;
    scrapper_duration: number | null;
    servers_parsed: number | null;
    servers_skipped: number | null;
    servers_posted: number | null;
}

async function fetchScrapperStatsData(currentPage = 1, itemsPerPage = 5): Promise<{ stats: ScrapperStats[]; totalPages: number }> {
    const skip = (currentPage - 1) * itemsPerPage;
    console.log(`Fetching scrapper stats data for page ${currentPage} and skipping ${skip}`);
    const stats = await db.select().from(rw_scrapper_stats).orderBy(desc(rw_scrapper_stats.date)).offset(skip).limit(itemsPerPage);

    console.log(`Fetching total stats count...`);
    const totalStatsCount = await db.select({ count: count() }).from(rw_scrapper_stats);
    console.log(`Total stats count:`, totalStatsCount);
    const totalPages = Math.ceil(totalStatsCount[0].count / itemsPerPage);
    console.log(`Total pages: ${totalPages}`);

    return { stats, totalPages };
}

interface ScrapperStatsPageProps {
    searchParams?: {
        page?: string;
    };
}

export default async function ScrapperStatsPage({ searchParams }: ScrapperStatsPageProps) {
    const currentPage = parseInt(searchParams?.page || '1');

    const { stats, totalPages } = await fetchScrapperStatsData(currentPage);

    return (
        <div className="h-full min-h-screen w-full bg-gradient-to-b from-secondary to-secondary_dark p-5">
            <h1 className="font-alegreya mb-4 text-center text-2xl font-bold uppercase tracking-wider text-secondary_light">
                Scrapper Stats
            </h1>
            <div className="table-container">
                <table className="mx-auto w-full max-w-2xl border-collapse rounded bg-primary_light">
                    <thead>
                        <tr>
                            <th className="font-lato rounded-tl bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-secondary_light">
                                Date
                            </th>
                            <th className="font-lato bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-secondary_light">
                                Duration
                            </th>
                            <th className="font-lato bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-secondary_light">
                                Servers Parsed
                            </th>
                            <th className="font-lato bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-secondary_light">
                                Servers Skipped
                            </th>
                            <th className="font-lato rounded-tr bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-secondary_light">
                                Servers Posted
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((stat) => (
                            <tr key={stat.id} className="text-center">
                                <td className="p-1">{stat.date ? new Date(stat.date).toLocaleString() : '-'}</td>
                                <td className="p-1">
                                    {stat.scrapper_duration !== null ? (
                                        <>
                                            {Math.floor(stat.scrapper_duration / 60)}
                                            min {stat.scrapper_duration % 60}s
                                        </>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="p-1">{stat.servers_parsed !== null ? stat.servers_parsed : '-'}</td>
                                <td className="p-1">{stat.servers_skipped !== null ? stat.servers_skipped : '-'}</td>
                                <td className="p-1">{stat.servers_posted !== null ? stat.servers_posted : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex w-full items-center justify-center">
                    <div className="mt-4 flex w-fit flex-row items-center justify-center rounded-lg bg-secondary_dark p-4">
                        <Link href={`/scrapper/stats?page=${currentPage - 1}`}>
                            <button
                                disabled={currentPage <= 1}
                                className="font-lato mx-2 rounded border border-secondary bg-primary px-5 py-2 text-base text-secondary_light hover:bg-primary_light disabled:cursor-not-allowed disabled:border-primary disabled:bg-secondary"
                            >
                                Prev
                            </button>
                        </Link>
                        <span className="font-lato mx-4 text-lg text-secondary_light">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Link href={`/scrapper/stats?page=${currentPage + 1}`}>
                            <button
                                disabled={currentPage >= totalPages}
                                className="font-lato mx-2 rounded border border-secondary bg-primary px-5 py-2 text-base text-secondary_light hover:bg-primary_light disabled:cursor-not-allowed disabled:border-primary disabled:bg-secondary"
                            >
                                Next
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
