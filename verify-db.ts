import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying database is empty...');

    const payments = await prisma.payment.count();
    const memberships = await prisma.membership.count();
    const users = await prisma.user.count();
    const settings = await prisma.settings.count();

    console.log(`Payments: ${payments}`);
    console.log(`Memberships: ${memberships}`);
    console.log(`Users: ${users}`);
    console.log(`Settings: ${settings}`);

    if (payments === 0 && memberships === 0 && users === 0 && settings === 0) {
        console.log('✅ Database is completely empty.');
    } else {
        console.error('❌ Database is NOT empty.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
