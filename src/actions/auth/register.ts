"use server";

import bcrypt from "bcrypt";
import { z } from "zod";

import { db } from "@/shared/lib/db";

const RegisterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        return { error: "Email already in use!" };
    }

    try {
        await db.user.create({
            data: {
                name,
                email,
                hashedPassword,
            },
        });

        return { success: "User created!" };
    } catch (error) {
        return { error: "Something went wrong!" };
    }
};
