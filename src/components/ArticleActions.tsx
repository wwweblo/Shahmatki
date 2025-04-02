'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ArticleActionsProps {
    articleId: string;
    isAuthor: boolean;
    onDelete: (articleId: string) => Promise<void>;
}

export function ArticleActions({ articleId, isAuthor, onDelete }: ArticleActionsProps) {
    const router = useRouter();

    if (!isAuthor) {
        return null;
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/articles/${articleId}/edit`)}
            >
                <Pencil className="w-4 h-4" />
            </Button>
            <form
                action={async () => {
                    await onDelete(articleId);
                    router.refresh();
                }}
            >
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </form>
        </>
    );
} 