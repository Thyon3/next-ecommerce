import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const db = new PrismaClient();

async function main() {
    try {
        // Cleanup
        await db.wishlist.deleteMany();
        await db.review.deleteMany();
        await db.orderItem.deleteMany();
        await db.order.deleteMany();
        await db.product.deleteMany();
        await db.category.deleteMany();
        await db.brand.deleteMany();
        await db.user.deleteMany();

        // Create Admin and User
        const hashedPassword = await bcrypt.hash("password123", 12);

        const admin = await db.user.create({
            data: {
                name: "Admin User",
                email: "admin@bitex.com",
                hashedPassword,
                role: Role.ADMIN,
            },
        });

        const user = await db.user.create({
            data: {
                name: "Regular User",
                email: "user@bitex.com",
                hashedPassword,
                role: Role.USER,
                address: {
                    street: "123 Main St",
                    city: "New York",
                    state: "NY",
                    postalCode: "10001",
                    country: "USA",
                },
            },
        });

        // Create Brands
        const apple = await db.brand.create({ data: { name: "Apple" } });
        const samsung = await db.brand.create({ data: { name: "Samsung" } });
        const sony = await db.brand.create({ data: { name: "Sony" } });

        // Create Categories
        const electronics = await db.category.create({
            data: {
                name: "Electronics",
                url: "electronics",
            },
        });

        const smartphones = await db.category.create({
            data: {
                name: "Smartphones",
                url: "smartphones",
                parentID: electronics.id,
            },
        });

        // Create Products
        const iphone = await db.product.create({
            data: {
                name: "iPhone 15 Pro",
                desc: "The latest iPhone with titanium design.",
                price: 999.99,
                categoryID: smartphones.id,
                brandID: apple.id,
                images: ["https://example.com/iphone15.jpg"],
                specialFeatures: ["Titanium", "A17 Pro chip"],
            },
        });

        const s23 = await db.product.create({
            data: {
                name: "Samsung Galaxy S23 Ultra",
                desc: "The ultimate Android smartphone.",
                price: 1199.99,
                categoryID: smartphones.id,
                brandID: samsung.id,
                images: ["https://example.com/s23ultra.jpg"],
                specialFeatures: ["200MP Camera", "S Pen included"],
            },
        });

        // Create Reviews
        await db.review.create({
            data: {
                rating: 5,
                comment: "Amazing phone! Highly recommend.",
                userId: user.id,
                productId: iphone.id,
            },
        });

        // Create Wishlist
        await db.wishlist.create({
            data: {
                userId: user.id,
                productId: s23.id,
            },
        });

        // Create Order
        await db.order.create({
            data: {
                userId: user.id,
                totalAmount: 999.99,
                status: OrderStatus.DELIVERED,
                shippingAddress: user.address!,
                items: {
                    create: [
                        {
                            productId: iphone.id,
                            quantity: 1,
                            price: 999.99,
                        },
                    ],
                },
            },
        });

        console.log("Seed data created successfully!");
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();
