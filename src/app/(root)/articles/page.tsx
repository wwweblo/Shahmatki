import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function ArticlesPage() {
    const session = await auth();
    const articles = await prisma.article.findMany({
        include: {
            author: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Статьи</h1>
                {session?.user && (
                    <Link
                        href="/articles/new"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Написать статью
                    </Link>
                )}
            </div>

            <div className="space-y-6">
                {articles.map((article) => (
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
                                    Автор:{' '}
                                    <Link
                                        href={`/authors/${article.author.id}`}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        {article.author.email || 'Аноним'}
                                    </Link>{' '}
                                    • {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                            {session?.user?.id === article.author.id && (
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
        </div>
    );
} 