import { prisma } from './src/lib/prisma';

async function fixOwnerAccount() {
    const email = 'joehary@northstarmedic.com';
    console.log(`Fixing account for: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('User not found. Creating admin user...');
            await prisma.user.create({
                data: {
                    email,
                    clinicName: 'NorthStar Medic Admin',
                    role: 'admin',
                    baaSignedAt: new Date(),
                    baaSignedIp: '127.0.0.1',
                }
            });
            console.log('Admin user created.');
        } else {
            console.log('User found. Updating permissions...');
            await prisma.user.update({
                where: { email },
                data: {
                    role: 'admin',
                    baaSignedAt: new Date(),
                }
            });
            console.log('Admin permissions granted and BAA marked as signed.');
        }
    } catch (error) {
        console.error('Error fixing account:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixOwnerAccount();
