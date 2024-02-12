'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '@/lib/helpers/useAnalytics';
import { fetch_scrapper_stats_data } from '@/lib/api_calls';

const ScrapperStatsPage = () => {
    useAnalytics();

    const [state, setState] = useState({
        stats: [],
        currentPage: 1,
        totalPages: 1,
    });

    const fetchStats = async () => {
        console.log('Fetching stats for page: ', state.currentPage);
        const data = await fetch_scrapper_stats_data(state.currentPage);
        const { stats, totalPages } = data;
        console.log('Stats: ', stats);
        console.log('Total Pages: ', totalPages);
        setState((prevState) => ({ ...prevState, stats: stats, totalPages }));
    };

    useEffect(() => {
        fetchStats();
    }, [state.currentPage]);

    const handlePrevPage = () => {
        setState((prevState) => ({
            ...prevState,
            currentPage: prevState.currentPage - 1,
        }));
    };

    const handleNextPage = () => {
        setState((prevState) => ({
            ...prevState,
            currentPage: prevState.currentPage + 1,
        }));
    };

    console.log('-'.repeat(3) + ' Rendering Scrapper Stats Page ' + '-'.repeat(3));

    return (
        <div className="h-full min-h-screen w-full bg-dark p-5">
            <h1 className="font-alegreya mb-8 text-center text-2xl uppercase tracking-wider text-grey">Scrapper Stats</h1>
            <div className="table-container">
                <table className="mx-auto w-full max-w-2xl border-collapse rounded bg-light">
                    <thead>
                        <tr>
                            <th className="font-lato rounded-tl border-l-2 border-r-2 border-t-2 bg-black px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-grey">
                                Date
                            </th>
                            <th className="font-lato bg-black px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-grey">
                                Duration
                            </th>
                            <th className="font-lato bg-black px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-grey">
                                Servers Parsed
                            </th>
                            <th className="font-lato bg-black px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-grey">
                                Servers Skipped
                            </th>
                            <th className="font-lato rounded-tr border-r-2 border-t-2 bg-black px-4 py-2 text-center text-lg font-bold uppercase tracking-wider text-grey">
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
                                        {Math.floor(stat.scrapper_duration / 60)}
                                        min {stat.scrapper_duration % 60}s
                                    </td>
                                    <td>{stat.servers_parsed}</td>
                                    <td>{stat.servers_skipped}</td>
                                    <td>{stat.servers_posted}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <div className="mt-8 flex justify-center rounded bg-black p-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={state.currentPage <= 1}
                        className="font-lato hover:bg-rustRed3 hover:border-rustRed3 mx-2 rounded border border-grey bg-transparent px-5 py-2 text-base text-grey transition-colors duration-300 focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-primary disabled:bg-primary"
                    >
                        Prev
                    </button>
                    <span className="font-lato mx-4 text-lg text-grey">
                        Page {state.currentPage} of {state.totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={state.currentPage >= state.totalPages}
                        className="font-lato hover:bg-rustRed3 hover:border-rustRed3 mx-2 rounded border border-grey bg-transparent px-5 py-2 text-base text-grey transition-colors duration-300 focus:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:border-primary disabled:bg-primary"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScrapperStatsPage;
