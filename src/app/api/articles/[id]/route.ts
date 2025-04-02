import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ArticleRouteProps {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: ArticleRouteProps) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const article = await prisma.article.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });

        if (!article) {
            return new NextResponse('Article not found', { status: 404 });
        }

        if (article.authorId !== session.user.id) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        return NextResponse.json(article);
    } catch (error) {
        console.error('Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PUT(request: Request, { params }: ArticleRouteProps) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const article = await prisma.article.findUnique({
            where: { id: params.id },
            select: { authorId: true },
        });

        if (!article) {
            return new NextResponse('Article not found', { status: 404 });
        }

        if (article.authorId !== session.user.id) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const body = await request.json();
        const { title, content, fenPosition, hasChessBoard } = body;

        if (!title || !content) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const updatedArticle = await prisma.article.update({
            where: { id: params.id },
            data: {
                title,
                content,
                fenPosition,
                hasChessBoard,
            },
        });

        return NextResponse.json(updatedArticle);
    } catch (error) {
        console.error('Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
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