const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLeads() {
    const total = await prisma.lead.count();
    const sourceStats = await prisma.lead.groupBy({
        by: ['source'],
        _count: { _all: true }
    });
    console.log('Total Leads:', total);
    console.log('Source Stats:', sourceStats);
    await prisma.$disconnect();
}
checkLeads();
