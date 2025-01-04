interface BattleMetricsServerResponse {
    data: {
        attributes: {
            name: string;
            players: number;
            maxPlayers: number;
            status: string;
            details: {
                rust_build: string;
            };
        };
    };
}

export interface BattleMetricsServerData {
    player_count: number;
    max_players: number;
    rust_build: string;
    status: 'online' | 'offline' | 'restarting';
}

export async function fetchBattleMetricsServerData(bmId: string): Promise<BattleMetricsServerData> {
    try {
        const response = await fetch(`https://api.battlemetrics.com/servers/${bmId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            next: { revalidate: 60 }, // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`BattleMetrics API error: ${response.status}`);
        }

        const data: BattleMetricsServerResponse = await response.json();

        return {
            player_count: data.data.attributes.players,
            max_players: data.data.attributes.maxPlayers,
            rust_build: data.data.attributes.details.rust_build || 'Unknown',
            status: data.data.attributes.status === 'online' ? 'online' : 'offline',
        };
    } catch (error) {
        console.error(`Failed to fetch BattleMetrics data for server ${bmId}:`, error);
        return {
            player_count: 0,
            max_players: 0,
            rust_build: 'Unknown',
            status: 'offline',
        };
    }
}
