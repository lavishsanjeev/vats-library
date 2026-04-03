import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database cleanup...');

    try {
        // Delete Payments
        const deletedPayments = await prisma.payment.deleteMany({});
        console.log(`✅ Deleted ${deletedPayments.count} payments.`);

        // Delete Memberships
        const deletedMemberships = await prisma.membership.deleteMany({});
        console.log(`✅ Deleted ${deletedMemberships.count} memberships.`);

        // Delete Users
        const deletedUsers = await prisma.user.deleteMany({});
        console.log(`✅ Deleted ${deletedUsers.count} users.`);

        // Delete Settings
        const deletedSettings = await prisma.settings.deleteMany({});
        console.log(`✅ Deleted ${deletedSettings.count} settings.`);

        console.log('🎉 Database cleanup completed successfully.');
    } catch (error) {
        console.error('❌ Failed to clean database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
