const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const claims = await prisma.claim.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- LATEST CLAIMS ---');
    console.log(JSON.stringify(claims, null, 2));

    const invoices = await prisma.invoice.findMany({
        where: { status: 'PAID' }
    });
    console.log('--- PAID INVOICES ---');
    console.log(JSON.stringify(invoices, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
