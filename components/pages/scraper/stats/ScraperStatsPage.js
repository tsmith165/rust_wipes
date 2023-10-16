'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '@/lib/helpers/useAnalytics';
import { fetch_scraper_stats_data } from '@/lib/api_calls';

const ScraperStatsPage = () => {
    useAnalytics();

    const [state, setState] = useState({
        stats: [],
        currentPage: 1,
        totalPages: 1,
    });

    const fetchStats = async () => {
        console.log('Fetching stats for page: ', state.currentPage);
        const data = await fetch_scraper_stats_data(state.currentPage);
        const { stats, totalPages } = data;
        console.log('Stats: ', stats);
        console.log('Total Pages: ', totalPages);
        setState((prevState) => ({ ...prevState, stats: stats, totalPages }));
    };

    useEffect(() => {
        fetchStats();
    }, [state.currentPage]);

    const handlePrevPage = () => {
        setState((prevState) => ({ ...prevState, currentPage: prevState.currentPage - 1 }));
    };

    const handleNextPage = () => {
        setState((prevState) => ({ ...prevState, currentPage: prevState.currentPage + 1 }));
    };

    console.log('-'.repeat(3) + ' Rendering Scrapper Stats Page ' + '-'.repeat(3));

    return (
        <div className="h-full w-full bg-medium p-5 min-h-screen">
            <h1 className="font-alegreya text-light text-2xl text-center mb-8 uppercase tracking-wider">
                Scraper Stats
            </h1>
            <div className="table-container">
                <table className="mx-auto border-collapse w-full max-w-2xl bg-primary rounded">
                    <thead>
                        <tr>
                            <th className="bg-dark text-light font-lato text-lg font-bold py-2 px-4 text-center uppercase tracking-wider border-l-2 border-t-2 border-r-2 rounded-tl">
                                Date
                            </th>
                            <th className="bg-dark text-light font-lato text-lg font-bold py-2 px-4 text-center uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="bg-dark text-light font-lato text-lg font-bold py-2 px-4 text-center uppercase tracking-wider">
                                Servers Parsed
                            </th>
                            <th className="bg-dark text-light font-lato text-lg font-bold py-2 px-4 text-center uppercase tracking-wider">
                                Servers Skipped
                            </th>
                            <th className="bg-dark text-light font-lato text-lg font-bold py-2 px-4 text-center uppercase tracking-wider border-t-2 border-r-2 rounded-tr">
                                Servers Posted
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {!!state.stats &&
                            state.stats.map((stat) => (
                                <tr key={stat.id}>
                                    <td>{new Date(stat.date).toLocaleString()}</td>
                                    <td>
                                        {Math.floor(stat.scraper_duration / 60)}min{' '}
                                        {stat.scraper_duration % 60}s
                                    </td>
                                    <td>{stat.servers_parsed}</td>
                                    <td>{stat.servers_skipped}</td>
                                    <td>{stat.servers_posted}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <div className="flex justify-center mt-8 p-4 rounded bg-dark">
                    <button
                        onClick={handlePrevPage}
                        disabled={state.currentPage <= 1}
                        className="text-light bg-transparent border border-light rounded px-5 py-2 font-lato text-base transition-colors duration-300 mx-2 hover:bg-rustRed3 hover:border-rustRed3 disabled:bg-secondary disabled:border-secondary disabled:cursor-not-allowed focus:outline-none focus:shadow-none">
                        Prev
                    </button>
                    <span className="font-lato text-lg text-light mx-4">
                        Page {state.currentPage} of {state.totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={state.currentPage >= state.totalPages}
                        className="text-light bg-transparent border border-light rounded px-5 py-2 font-lato text-base transition-colors duration-300 mx-2 hover:bg-rustRed3 hover:border-rustRed3 disabled:bg-secondary disabled:border-secondary disabled:cursor-not-allowed focus:outline-none focus:shadow-none">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScraperStatsPage;
