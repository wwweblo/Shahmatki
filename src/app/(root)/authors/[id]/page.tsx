import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {Pencil,Trash2} from 'lucide-react'

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
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {author.name || author.email || 'Анонимный автор'}
                    </CardTitle>
                    {author.email && (
                        <CardDescription>{author.email}</CardDescription>
                    )}
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Статьи автора</CardTitle>
                </CardHeader>
                <CardContent>
                    {author.articles.length === 0 ? (
                        <p className="text-muted-foreground">У автора пока нет статей</p>
                    ) : (
                        <div className="space-y-6">
                            {author.articles.map((article) => (
                                <Card key={article.id}>
                                    <CardHeader>
                                        <div className="flex flex-col justify-between items-start">
                                            <div>
                                                <Link
                                                    href={`/articles/${article.id}`}
                                                    className="text-xl font-semibold hover:text-primary"
                                                >
                                                    {article.title}
                                                </Link>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                                                </p>
                                            </div>
                                            {isCurrentUser && (
                                                <div className="flex space-x-2 bg-neutral-300 items-center px-4 rounded-full">
                                                    <Link
                                                        href={`/articles/${article.id}/edit`}
                                                        className="text-sm text-primary hover:text-primary/80"
                                                    >
                                                        <Pencil width={'1rem'}/>
                                                    </Link>
                                                    <form
                                                        action={`/api/articles/${article.id}`}
                                                        method="DELETE"
                                                        className="flex items-center"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-sm text-destructive hover:text-destructive/80"
                                                        >
                                                            <Trash2 width={'1rem'}/>
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {`${article.content.slice(0, 200)}${
                                                    article.content.length > 200 ? '...' : ''
                                                }`}
                                            </ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 