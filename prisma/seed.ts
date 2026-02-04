import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Brands
    const apple = await prisma.brand.upsert({
        where: { name: 'Apple' },
        update: {},
        create: {
            name: 'Apple',
        },
    });

    const samsung = await prisma.brand.upsert({
        where: { name: 'Samsung' },
        update: {},
        create: {
            name: 'Samsung',
        },
    });

    const nike = await prisma.brand.upsert({
        where: { name: 'Nike' },
        update: {},
        create: {
            name: 'Nike',
        },
    });

    console.log('Created brands:', { apple, samsung, nike });

    // 2. Create Categories
    // Electronics
    const electronics = await prisma.category.create({
        data: {
            name: 'Electronics',
            url: 'electronics',
            iconUrl: 'https://example.com/icons/electronics.png',
            iconSize: [24, 24],
            products: {
                create: [
                    {
                        name: 'iPhone 15',
                        price: 999,
                        brandID: apple.id,
                        images: ['https://example.com/iphone.jpg'],
                        // Specs are structured differently in the schema provided 
                        // The schema says `specs ProductSpec[]` where ProductSpec is a type.
                        specs: [
                            { specGroupID: 'Display', specValues: ['6.1 inch OLED'] }
                        ]
                    },
                ],
            },
        },
    });

    // Clothing
    const clothing = await prisma.category.create({
        data: {
            name: 'Clothing',
            url: 'clothing',
            iconUrl: 'https://example.com/icons/clothing.png',
            iconSize: [24, 24],
            products: {
                create: [
                    {
                        name: 'Air Force 1',
                        price: 120,
                        brandID: nike.id,
                        images: ['https://example.com/nike.jpg'],
                        specs: [
                            { specGroupID: 'Material', specValues: ['Leather'] }
                        ]
                    },
                ],
            },
        },
    });

    console.log('Created categories:', { electronics, clothing });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
