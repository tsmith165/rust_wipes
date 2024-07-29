import '@/lib/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
    rw_parsed_server,
    rw_wipe_history,
    rw_scrapper_stats,
    rw_server_network,
    kits_table,
    kit_extra_images_table,
    pending_tranactions_table,
    verified_tranactions_table,
} from './schema';

const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql);

export {
    db,
    rw_parsed_server,
    rw_wipe_history,
    rw_scrapper_stats,
    rw_server_network,
    kits_table,
    kit_extra_images_table,
    pending_tranactions_table,
    verified_tranactions_table,
};
