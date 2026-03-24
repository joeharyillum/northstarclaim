const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  // Set a strong password for the owner account
  const password = 'NorthStar2026!Med';
  const hashed = await bcrypt.hash(password, 12);
  
  const updated = await p.user.update({
    where: { email: 'joehary@northstarmedic.com' },
    data: { password: hashed },
  });

  console.log('Password set successfully for:', updated.email);
  console.log('Role:', updated.role);
  console.log('');
  console.log('=== YOUR LOGIN CREDENTIALS ===');
  console.log('Email: joehary@northstarmedic.com');
  console.log('Password: NorthStar2026!Med');
  console.log('URL: https://www.northstarmedic.com/login');
  console.log('==============================');
  
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
