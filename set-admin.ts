import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address.');
        console.log('Usage: npx tsx set-admin.ts <email>');
        process.exit(1);
    }

    console.log(`Looking for user with email: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        console.log('Please ask the client to sign up / log in to the website first.');
        process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.id})`);
    console.log(`Current role: ${user.role}`);

    const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });

    console.log(`\n✅ Success! User ${updatedUser.name} is now an ADMIN.`);
    console.log('They can now access /admin');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
