import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Ошибка при получении статей:', error);
        return NextResponse.json(
            { error: 'Ошибка при получении статей' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Заголовок и содержание обязательны' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Пользователь не найден' },
                { status: 404 }
            );
        }

        const article = await prisma.article.create({
            data: {
                title,
                content,
                authorId: user.id,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        console.error('Ошибка при создании статьи:', error);
        return NextResponse.json(
            { error: 'Ошибка при создании статьи' },
            { status: 500 }
        );
    }
} 