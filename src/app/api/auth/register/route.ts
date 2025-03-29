import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        try {
            const validatedCredentials = registerSchema.parse(body);

            // Проверяем, существует ли пользователь с таким email
            const existingUserByEmail = await prisma.user.findUnique({
                where: {
                    email: validatedCredentials.email
                }
            });

            if (existingUserByEmail) {
                return NextResponse.json(
                    { error: "Пользователь с таким email уже существует" },
                    { status: 400 }
                );
            }

            // Проверяем, существует ли пользователь с таким username
            const existingUserByUsername = await prisma.user.findUnique({
                where: {
                    username: validatedCredentials.username
                }
            });

            if (existingUserByUsername) {
                return NextResponse.json(
                    { error: "Пользователь с таким псевдонимом уже существует" },
                    { status: 400 }
                );
            }

            // Создаем нового пользователя
            await prisma.user.create({
                data: {
                    email: validatedCredentials.email,
                    password: validatedCredentials.password,
                    username: validatedCredentials.username
                }
            });

            return NextResponse.json(
                { message: "Пользователь успешно зарегистрирован" },
                { status: 201 }
            );
        } catch (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: "Ошибка при регистрации пользователя" },
            { status: 400 }
        );
    }
} 