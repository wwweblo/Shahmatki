import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const article = await prisma.article.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!article) {
            return NextResponse.json(
                { error: 'Статья не найдена' },
                { status: 404 }
            );
        }

        return NextResponse.json(article);
    } catch (error) {
        console.error('Ошибка при получении статьи:', error);
        return NextResponse.json(
            { error: 'Ошибка при получении статьи' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const article = await prisma.article.findUnique({
            where: { id: params.id },
            include: { author: true },
        });

        if (!article) {
            return NextResponse.json(
                { error: 'Статья не найдена' },
                { status: 404 }
            );
        }

        if (article.author.email !== session.user.email) {
            return NextResponse.json(
                { error: 'Нет прав на редактирование этой статьи' },
                { status: 403 }
            );
        }

        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Заголовок и содержание обязательны' },
                { status: 400 }
            );
        }

        const updatedArticle = await prisma.article.update({
            where: { id: params.id },
            data: { title, content },
        });

        return NextResponse.json(updatedArticle);
    } catch (error) {
        console.error('Ошибка при обновлении статьи:', error);
        return NextResponse.json(
            { error: 'Ошибка при обновлении статьи' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const article = await prisma.article.findUnique({
            where: { id: params.id },
            include: { author: true },
        });

        if (!article) {
            return NextResponse.json(
                { error: 'Статья не найдена' },
                { status: 404 }
            );
        }

        if (article.author.email !== session.user.email) {
            return NextResponse.json(
                { error: 'Нет прав на удаление этой статьи' },
                { status: 403 }
            );
        }

        await prisma.article.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Статья успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении статьи:', error);
        return NextResponse.json(
            { error: 'Ошибка при удалении статьи' },
            { status: 500 }
        );
    }
} 