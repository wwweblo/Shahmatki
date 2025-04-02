import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchForm } from '@/components/SearchForm';
import { ArticleActions } from '@/components/ArticleActions';

// Добавляем серверное действие для удаления статьи
async function deleteArticle(articleId: string) {
  'use server'
  
  const session = await auth();
  if (!session?.user) {
    return;
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true }
  });

  if (article?.authorId !== session.user.id) {
    return;
  }

  await prisma.article.delete({
    where: { id: articleId }
  });

  revalidatePath('/articles');
}

interface ArticlesPageProps {
    searchParams: {
        search?: string;
    };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
    const session = await auth();
    const search = searchParams?.search || '';

    const articles = await prisma.article.findMany({
        where: {
            OR: [
                { title: { contains: search } },
                { author: { username: { contains: search } } },
                { author: { email: { contains: search } } }
            ]
        },
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

    return (
        <div className="w-[90%] mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Статьи</h1>
                {session?.user && (
                    <Button asChild>
                        <Link href="/articles/new">
                            Написать статью
                        </Link>
                    </Button>
                )}
            </div>

            <div className="mb-8">
                <SearchForm defaultValue={search} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <Card key={article.id}>
                        <CardHeader className='!gap-4'>
                            <CardTitle>
                                <Link
                                    href={`/articles/${article.id}`}
                                    className="hover:text-blue-300 transition-colors"
                                >
                                    {article.title}
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                <Link
                                    href={`/authors/${article.author.id}`}
                                    className="bg-blue-300 text-background px-2 py-1 rounded-full"
                                >
                                    {article.author.username || 'Аноним'}
                                </Link>{' '}
                                • {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                            </CardDescription>
                            </CardHeader>
                            <CardFooter className='justify-start'>
                                <ArticleActions
                                    articleId={article.id}
                                    isAuthor={session?.user?.id === article.author.id}
                                    onDelete={deleteArticle}
                                />
                            </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
} 