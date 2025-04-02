import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleEditor } from '@/components/ArticleEditor';

interface ArticlePageProps {
    params: {
        id: string;
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const session = await auth();
    const article = await prisma.article.findUnique({
        where: { id: params.id },
        include: {
            author: {
                select: {
                    email: true,
                },
            },
        },
    });

    if (!article) {
        notFound();
    }

    const isAuthor = session?.user?.email === article.author.email;

    return (
        <div className="py-8 px-3 md:max-w-[90%] md:mx-auto">
            <ArticleEditor article={{...article, author: {...article.author, id: article.authorId}}} isAuthor={isAuthor} />
        </div>
    );
}