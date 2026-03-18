process.chdir(__dirname);
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.lead.count().then(c => {
    console.log('DB lead count:', c);
    return p.$disconnect();
});
