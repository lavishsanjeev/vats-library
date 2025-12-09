import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'vatssachin2002@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });
    console.log(`User ${email} role: ${user?.role}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
