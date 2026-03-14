const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const count = await p.lead.count();
  console.log('Total leads:', count);

  const samples = await p.lead.findMany({ take: 5 });
  console.log('\nSample leads:');
  samples.forEach(l => console.log(`  ${l.firstName} ${l.lastName} | ${l.title} | ${l.company} | ${l.email} | ${l.state}`));

  const byState = await p.lead.groupBy({ by: ['state'], _count: true, orderBy: { _count: { state: 'desc' } } });
  console.log('\nBy state:');
  byState.forEach(s => console.log(`  ${s.state}: ${s._count}`));

  const bySource = await p.lead.groupBy({ by: ['source'], _count: true });
  console.log('\nBy source:');
  bySource.forEach(s => console.log(`  ${s.source}: ${s._count}`));

  await p['$disconnect']();
}
main();
