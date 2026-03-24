const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const l = await p.lead.findFirst();
  console.log(JSON.stringify(l, null, 2));
  await p.$disconnect();
})();
