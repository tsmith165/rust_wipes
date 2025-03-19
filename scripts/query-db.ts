import { db } from '../src/db/db';
import { player_stats } from '../src/db/schema';

async function main() {
    try {
        const stats = await db.select().from(player_stats).limit(5);
        console.log('Player Stats:', JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

main();
