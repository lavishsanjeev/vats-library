import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'vatslibrary@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });
    console.log(`User ${email} role: ${user?.role}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
