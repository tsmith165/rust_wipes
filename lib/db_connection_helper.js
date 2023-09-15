const { PrismaClient } = require('@prisma/client');
const { URL } = require('url');

function parse_db_connection_details(URI) {
    const result = new URL(URI);
    return {
        database: result.pathname.substr(1),
        username: result.username,
        password: result.password,
        hostname: result.hostname,
        port: result.port,
    };
}

async function create_db_connection(databaseUrl) {
    const dbDetails = parse_db_connection_details(databaseUrl);
    let prisma;

    try {
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: `postgresql://${dbDetails.username}:${dbDetails.password}@${dbDetails.hostname}:${dbDetails.port}/${dbDetails.database}`
                }
            }
        });
        await prisma.$connect();
        console.log('Successfully connected to the database.');
        return prisma;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        return null;
    }
}

module.exports = {
    parse_db_connection_details,
    create_db_connection
};