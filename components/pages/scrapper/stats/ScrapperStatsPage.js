import React from 'react';
import PropTypes from 'prop-types';
import { rw_scrapper_stats } from '@/db/schema';
import { db } from '@/db/db';
import { desc } from 'drizzle-orm';
import { count } from 'drizzle-orm/sql';
import Link from 'next/link';

async function fetchScrapperStatsData(currentPage = 1, itemsPerPage = 5) {
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

export default async function ScrapperStatsPage({ searchParams }) {
    const currentPage = parseInt(searchParams.page) || 1;

    // eslint-disable-next-line no-unused-vars
    const { stats, totalPages } = await fetchScrapperStatsData(currentPage);

    return (
        <div className="to-secondary_dark h-full min-h-screen w-full bg-gradient-to-b from-secondary p-5">
            <h1 className="font-alegreya text-secondary_light mb-4 text-center text-2xl font-bold uppercase tracking-wider">
                Scrapper Stats
            </h1>
            <div className="table-container">
                <table className="bg-primary_light mx-auto w-full max-w-2xl border-collapse rounded">
                    <thead>
                        <tr>
                            <th className="font-lato text-secondary_light bg-secondary_dark rounded-tl px-4 py-2 text-center text-lg font-bold uppercase tracking-wider">
                                Date
                            </th>
                            <th className="font-lato text-secondary_light bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="font-lato text-secondary_light bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider">
                                Servers Parsed
                            </th>
                            <th className="font-lato text-secondary_light bg-secondary_dark px-4 py-2 text-center text-lg font-bold uppercase tracking-wider">
                                Servers Skipped
                            </th>
                            <th className="font-lato text-secondary_light bg-secondary_dark rounded-tr px-4 py-2 text-center text-lg font-bold uppercase tracking-wider">
                                Servers Posted
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((stat) => (
                            <tr key={stat.id} className="text-center">
                                <td className="p-1">{new Date(stat.date).toLocaleString()}</td>
                                <td className="p-1">
                                    {Math.floor(stat.scrapper_duration / 60)}
                                    min {stat.scrapper_duration % 60}s
                                </td>
                                <td className="p-1">{stat.servers_parsed}</td>
                                <td className="p-1">{stat.servers_skipped}</td>
                                <td className="p-1">{stat.servers_posted}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 flex w-full items-center justify-center">
                    <div className="bg-secondary_dark mt-4 flex w-fit flex-row items-center justify-center rounded-lg p-4">
                        <Link href={`/scrapper/stats?page=${currentPage - 1}`}>
                            <button
                                disabled={currentPage <= 1}
                                className="font-lato hover:bg-primary_light text-secondary_light mx-2 rounded border border-secondary bg-primary px-5 py-2 text-base disabled:cursor-not-allowed disabled:border-primary disabled:bg-secondary"
                            >
                                Prev
                            </button>
                        </Link>
                        <span className="font-lato text-secondary_light mx-4 text-lg">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Link href={`/scrapper/stats?page=${currentPage + 1}`}>
                            <button
                                disabled={currentPage >= totalPages}
                                className="font-lato hover:bg-primary_light text-secondary_light mx-2 rounded border border-secondary bg-primary px-5 py-2 text-base disabled:cursor-not-allowed disabled:border-primary disabled:bg-secondary"
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

ScrapperStatsPage.propTypes = {
    searchParams: PropTypes.object.isRequired,
};
