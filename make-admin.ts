import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address: npx tsx make-admin.ts <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`✅ User ${user.email} is now an ADMIN.`);
    } catch (error) {
        console.error('❌ Failed to update user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
