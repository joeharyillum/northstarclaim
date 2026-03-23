const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function setup() {
  const users = [
    { email: 'admin@mediclaim.ai', role: 'admin', clinicName: 'Admin Clinic' },
    { email: 'biller@mediclaim.ai', role: 'biller', clinicName: 'Biller Clinic' },
    { email: 'client@mediclaim.ai', role: 'client', clinicName: 'Client Clinic' }
  ];
  const password = await bcrypt.hash('Testpassword123!', 10);
  
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password },
      create: { ...u, password }
    });
  }
  console.log('Test users created.');
}
setup().finally(() => prisma.$disconnect());
