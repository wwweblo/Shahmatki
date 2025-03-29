import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import ArticleEditor from '@/components/article-editor';

interface EditArticlePageProps {
    params: {
        id: string;
    };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth');
    }

    const article = await prisma.article.findUnique({
        where: { id: params.id },
        include: { author: true },
    });

    if (!article) {
        redirect('/articles');
    }

    if (article.author.email !== session.user.email) {
        redirect('/articles');
    }

    return <ArticleEditor article={article} mode="edit" />;
} 