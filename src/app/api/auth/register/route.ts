import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { schema } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedCredentials = schema.parse(body);

        // Проверяем, существует ли пользователь
        const existingUser = await prisma.user.findUnique({
            where: {
                email: validatedCredentials.email
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Пользователь с таким email уже существует" },
                { status: 400 }
            );
        }

        // Создаем нового пользователя
        await prisma.user.create({
            data: {
                email: validatedCredentials.email,
                password: validatedCredentials.password
            }
        });

        return NextResponse.json(
            { message: "Пользователь успешно зарегистрирован" },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: "Ошибка при регистрации пользователя" },
            { status: 400 }
        );
    }
} 