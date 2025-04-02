import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleEditorWrapper } from '@/components/ArticleEditorWrapper';

type Props = {
    params: {
        id: string;
    };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
    const articles = await prisma.article.findMany({
        select: { id: true }
    });

    return articles.map((article) => ({
        id: article.id
    }));
}

export async function generateMetadata({ params }: Props) {
    const article = await prisma.article.findUnique({
        where: { id: params.id },
        select: { title: true }
    });

    if (!article) {
        return {
            title: 'Статья не найдена'
        };
    }

    return {
        title: article.title
    };
}

export default async function ArticlePage({ params }: Props) {
    const session = await auth();
    const article = await prisma.article.findUnique({
        where: { id: params.id },
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                    username: true,
                },
            },
        },
    });

    if (!article) {
        notFound();
    }

    const isAuthor = session?.user?.id === article.author.id;

    return (
        <div className="w-[90%] mx-auto py-8 px-4">
            <article className="prose prose-lg max-w-none">
                <ArticleEditorWrapper
                    article={article}
                    isAuthor={isAuthor}
                />
            </article>
        </div>
    );
}