const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const total = await p.lead.count();
  console.log('Total leads in DB:', total);
  
  const byStatus = await p.lead.groupBy({ by: ['status'], _count: true });
  console.log('By status:', JSON.stringify(byStatus, null, 2));
  
  await p.$disconnect();
}

main();
