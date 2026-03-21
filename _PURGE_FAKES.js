require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purgeFakeLeadsDirect() {
    console.log('🧹 PURGING FAKE LEADS FROM DATABASE...');
    try {
        const deleted = await prisma.lead.deleteMany({
            where: {
                OR: [
                    { email: { contains: 'test', mode: 'insensitive' } },
                    { email: { contains: 'simulation', mode: 'insensitive' } },
                    { email: { contains: 'example', mode: 'insensitive' } },
                    { firstName: { contains: 'test', mode: 'insensitive' } },
                    { lastName: { contains: 'test', mode: 'insensitive' } },
                    { company: { contains: 'test', mode: 'insensitive' } },
                    { company: { contains: 'Simul', mode: 'insensitive' } }
                ]
            }
        });
        console.log(`✅ Successfully deleted ${deleted.count} fake leads.`);
    } catch (e) {
        console.error('❌ Error purging leads:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

purgeFakeLeadsDirect();
