import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Получение атрибутов пользователя
export async function GET(request: Request) {
    try {
        // Проверяем авторизацию
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 }
            );
        }

        // Получаем ID пользователя из URL параметров
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: "ID пользователя не указан" },
                { status: 400 }
            );
        }

        // Получаем пользователя с его атрибутами
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                attributes: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Пользователь не найден" },
                { status: 404 }
            );
        }

        return NextResponse.json(user.attributes);
    } catch (error) {
        console.error("Ошибка при получении атрибутов:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}

// PUT: Обновление атрибутов пользователя
export async function PUT(request: Request) {
    try {
        // Проверяем авторизацию
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Не авторизован" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId, attributeIds } = body;

        if (!userId || !Array.isArray(attributeIds)) {
            return NextResponse.json(
                { error: "Некорректные данные запроса" },
                { status: 400 }
            );
        }

        // Обновляем атрибуты пользователя
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                attributes: {
                    set: attributeIds.map(id => ({ id }))
                }
            },
            include: {
                attributes: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Ошибка при обновлении атрибутов:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}