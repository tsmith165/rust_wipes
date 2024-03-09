const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllData() {
    try {
        await prisma.server.deleteMany();
        await prisma.server_data.deleteMany();
        await prisma.parsed_server.deleteMany();
        await prisma.server_data_test.deleteMany();
        await prisma.parsed_server_test.deleteMany();
        await prisma.scrapper_stats.deleteMany();

        console.log('All data deleted successfully');
    } catch (error) {
        console.error('Error deleting data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllData();
