const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DATABASE INSPECTION ---');
    
    const userCount = await prisma.user.count();
    console.log('Users:', userCount);
    
    const claimCount = await prisma.claim.count();
    console.log('Claims:', claimCount);
    
    const pBatchCount = await prisma.uploadBatch.count();
    console.log('UploadBatches:', pBatchCount);
    
    const payerCount = await prisma.payer.count();
    console.log('Payers:', payerCount);

    if (claimCount > 0) {
        const sampleClaims = await prisma.claim.findMany({ take: 5 });
        console.log('Sample Claims:', JSON.stringify(sampleClaims, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
