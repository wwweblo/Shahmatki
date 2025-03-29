import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ArticleEditor from '@/components/article-editor';

export default async function NewArticlePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth');
    }

    return <ArticleEditor mode="create" />;
} 