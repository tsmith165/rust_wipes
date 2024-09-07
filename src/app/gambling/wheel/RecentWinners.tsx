import { getRecentWinners } from './wheelActions';

export default async function RecentWinners() {
    const winners = await getRecentWinners();

    return (
        <div className="rounded bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-bold">Recent Winners</h2>
            <ul>
                {winners.map((winner, index) => (
                    <li key={index} className="mb-2">
                        <span className="font-semibold">{winner.player_name}</span> won {winner.result}
                    </li>
                ))}
            </ul>
        </div>
    );
}
