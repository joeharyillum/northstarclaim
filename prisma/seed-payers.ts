/**
 * SEED SCRIPT: INITIAL PAYER ROUTING DATA
 * 
 * Populates the database with common insurance company addresses and fax numbers
 * to enable zero-touch Phase 20 dispatch.
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const payers = [
        {
            name: "UnitedHealthcare",
            faxNumber: "1-800-456-7890",
            streetAddress: "9700 Health Care Lane",
            city: "Minnetonka",
            state: "MN",
            zip: "55343"
        },
        {
            name: "Aetna",
            faxNumber: "1-860-273-0123",
            streetAddress: "151 Farmington Avenue",
            city: "Hartford",
            state: "CT",
            zip: "06156"
        },
        {
            name: "Blue Cross Blue Shield (NJ)",
            faxNumber: "1-973-466-4000",
            streetAddress: "3 Penn Plaza East",
            city: "Newark",
            state: "NJ",
            zip: "07105"
        },
        {
            name: "Cigna",
            faxNumber: "1-800-244-6224",
            streetAddress: "900 Cottage Grove Road",
            city: "Bloomfield",
            state: "CT",
            zip: "06002"
        }
    ];

    console.log("Seeding Payer Intelligence...");

    for (const payer of payers) {
        await prisma.payer.upsert({
            where: { name: payer.name },
            update: payer,
            create: payer
        });
    }

    console.log("Seeding complete. Neural Army now has target coordinates.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
