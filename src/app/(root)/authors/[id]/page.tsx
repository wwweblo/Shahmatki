import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AuthorPageProps {
    params: {
        id: string;
    };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
    const session = await auth();
    const author = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
            articles: {
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    });

    if (!author) {
        notFound();
    }

    const isCurrentUser = session?.user?.id === author.id;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {author.name || author.email || 'Анонимный автор'}
                </h1>
                {author.email && (
                    <p className="mt-2 text-sm text-gray-500">{author.email}</p>
                )}
            </div>

            <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-gray-900">Статьи автора</h2>
                {author.articles.length === 0 ? (
                    <p className="text-gray-500">У автора пока нет статей</p>
                ) : (
                    <div className="space-y-6">
                        {author.articles.map((article) => (
                            <article
                                key={article.id}
                                className="bg-white shadow rounded-lg p-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Link
                                            href={`/articles/${article.id}`}
                                            className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
                                        >
                                            {article.title}
                                        </Link>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                    {isCurrentUser && (
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/articles/${article.id}/edit`}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                Редактировать
                                            </Link>
                                            <form
                                                action={`/api/articles/${article.id}`}
                                                method="DELETE"
                                                className="inline"
                                            >
                                                <button
                                                    type="submit"
                                                    className="text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Удалить
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {`${article.content.slice(0, 200)}${
                                            article.content.length > 200 ? '...' : ''
                                        }`}
                                    </ReactMarkdown>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 