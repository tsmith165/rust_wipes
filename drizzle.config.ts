// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
    schema: './db/*',
    out: './drizzle',
    driver: 'mysql2',
    dbCredentials: {
        uri: (process.env.DATABASE_URL as string) || '',
    },
} satisfies Config;
