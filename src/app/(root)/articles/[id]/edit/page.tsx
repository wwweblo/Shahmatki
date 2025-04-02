'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChessBoard } from '@/components/ChessBoard';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { useSession } from 'next-auth/react';

interface EditArticlePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [fenPosition, setFenPosition] = useState('');
    const [hasChessBoard, setHasChessBoard] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { id } = use(params);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        // Загружаем данные статьи
        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/articles/${id}`);
                if (!response.ok) {
                    throw new Error('Статья не найдена');
                }
                const article = await response.json();
                
                setTitle(article.title);
                setContent(article.content);
                setFenPosition(article.fenPosition || '');
                setHasChessBoard(article.hasChessBoard);
            } catch (error) {
                console.error('Ошибка загрузки статьи:', error);
                router.push('/articles');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [id, status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    fenPosition: hasChessBoard ? fenPosition : null,
                    hasChessBoard,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            router.push(`/articles/${id}`);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при обновлении статьи');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="w-[90%] mx-auto py-8 px-4">
                <div className="text-center">Загрузка...</div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="w-[90%] mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Редактирование статьи</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        label="Содержание"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="hasChessBoard"
                        checked={hasChessBoard}
                        onCheckedChange={(checked) => setHasChessBoard(checked as boolean)}
                    />
                    <Label htmlFor="hasChessBoard">Добавить шахматную позицию</Label>
                </div>

                {hasChessBoard && (
                    <div className="mt-8">
                        <Label>Шахматная позиция</Label>
                        <ChessBoard 
                            initialFen={fenPosition}
                            onChange={setFenPosition} 
                        />
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => router.push(`/articles/${id}`)}
                    >
                        Отмена
                    </Button>
                </div>
            </form>
        </div>
    );
} 