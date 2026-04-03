import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address as an argument.');
        process.exit(1);
    }

    console.log(`Attempting to revoke admin access from ${email}...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'STUDENT' },
        });

        console.log(`Success! User ${user.email} is now a STUDENT.`);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
