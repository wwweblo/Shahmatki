'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ArticleEditorProps {
    article?: Article;
    mode: 'create' | 'edit';
}

export default function ArticleEditor({ article, mode }: ArticleEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(article?.title || '');
    const [content, setContent] = useState(article?.content || '');
    const [isPreview, setIsPreview] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                mode === 'create' ? '/api/articles' : `/api/articles/${article?.id}`,
                {
                    method: mode === 'create' ? 'POST' : 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content }),
                }
            );

            if (!response.ok) throw new Error('Failed to save article');
            router.push('/articles');
        } catch (error) {
            console.error('Error saving article:', error);
        }
    };

    const insertMarkdown = (markdown: string) => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        
        let newText = content;
        if (selectedText) {
            newText = content.substring(0, start) + markdown.replace('$1', selectedText) + content.substring(end);
        } else {
            newText = content.substring(0, start) + markdown + content.substring(start);
        }

        setContent(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + markdown.length, start + markdown.length);
        }, 0);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="title">
                        Название
                    </Label>
                    <Input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 py-1 px-3 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <Button
                            onClick={() => insertMarkdown('**$1**')}
                            title="Жирный текст"
                        >
                            B
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('*$1*')}
                            title="Курсив"
                        >
                            I
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('# $1')}
                            title="Заголовок"
                        >
                            H1
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('## $1')}
                            title="Подзаголовок"
                        >
                            H2
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('- $1')}
                            title="Список"
                        >
                            • List
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('1. $1')}
                            title="Нумерованный список"
                        >
                            1. List
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('> $1')}
                            title="Цитата"
                        >
                            {'>'} Quote
                        </Button>
                        <Button
                            onClick={() => insertMarkdown('`$1`')}
                            title="Код"
                        >
                            Code
                        </Button>
                        <Button
                        className='bg-blue-300 text-background'
                        onClick={() => setIsPreview(!isPreview)} 
                    >
                        {isPreview ? 'Редактировать' : 'Предпросмотр'}
                    </Button>
                    </div>
                    
                </div>

                <div>
                    <Label htmlFor="content">
                        Содержание
                    </Label>
                    {isPreview ? (
                        <div className="mt-1 block w-full rounded-md border-1 border-neutral-300 p-2 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 block w-full rounded-md border-1 p-2 border-gray-300 shadow-sm focus:border-blue-300 focus:ring-blue-300"
                            rows={20}
                            required
                        />
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        onClick={() => router.push('/articles')}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                    >
                        {mode === 'create' ? 'Создать' : 'Сохранить'}
                    </Button>
                </div>
            </form>
        </div>
    );
} 