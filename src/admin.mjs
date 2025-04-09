import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        // Create or find the admin attribute
        const attribute = await prisma.attribute.upsert({
            where: { name: 'admin-users' },
            update: {},
            create: { name: 'admin-users' }
        });
        console.log('Attribute ready:', attribute);

        // Connect single attribute to the user
        const updatedUser = await prisma.user.update({
            where: {
                id: 'cm99qjg740000hbh71d1x6vgv'
            },
            data: {
                attributes: {
                    connect: {
                        name: 'admin-users'
                    }
                }
            },
            include: {
                attributes: true
            }
        });
        console.log('User updated:', updatedUser);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();