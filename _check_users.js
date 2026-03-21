const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    const users = await p.user.findMany({
      select: { id: true, email: true, role: true, clinicName: true, password: true }
    });
    users.forEach(u => {
      console.log(`${u.email} | role: ${u.role} | clinic: ${u.clinicName} | has_pw: ${!!u.password}`);
    });
    if (users.length === 0) console.log('NO USERS IN DB');
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}
main();
