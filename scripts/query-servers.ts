import { db } from '../src/db/db';
import { rw_servers } from '../src/db/schema';

async function main() {
    try {
        const servers = await db.select().from(rw_servers);
        console.log('Servers:', JSON.stringify(servers, null, 2));
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

main();
