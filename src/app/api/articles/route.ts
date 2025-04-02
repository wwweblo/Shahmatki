import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
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
        return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Необходима авторизация', { status: 401 });
        }

        const body = await request.json();
        const { title, content, fenPosition, hasChessBoard } = body;

        if (!title || !content) {
            return new NextResponse('Заголовок и содержание обязательны', { status: 400 });
        }

        const article = await prisma.article.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                fenPosition: hasChessBoard ? fenPosition : null,
                hasChessBoard,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        console.error('Ошибка при создании статьи:', error);
        return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
    }
} 