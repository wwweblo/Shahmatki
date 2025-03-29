'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Название
                    </label>
                    <input
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
                        <button
                            type="button"
                            onClick={() => insertMarkdown('**$1**')}
                            className="neutral-button"
                            title="Жирный текст"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('*$1*')}
                            className="neutral-button"
                            title="Курсив"
                        >
                            I
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('# $1')}
                            className="neutral-button"
                            title="Заголовок"
                        >
                            H1
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('## $1')}
                            className="neutral-button"
                            title="Подзаголовок"
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('- $1')}
                            className="neutral-button"
                            title="Список"
                        >
                            • List
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('1. $1')}
                            className="neutral-button"
                            title="Нумерованный список"
                        >
                            1. List
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('> $1')}
                            className="neutral-button"
                            title="Цитата"
                        >
                            {'>'} Quote
                        </button>
                        <button
                            type="button"
                            onClick={() => insertMarkdown('`$1`')}
                            className="neutral-button"
                            title="Код"
                        >
                            Code
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className="neutral-button"
                    >
                        {isPreview ? 'Редактировать' : 'Предпросмотр'}
                    </button>
                </div>

                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Содержание
                    </label>
                    {isPreview ? (
                        <div className="mt-1 block w-full rounded-md max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows={20}
                            required
                        />
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.push('/articles')}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded"
                    >
                        {mode === 'create' ? 'Создать' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </div>
    );
} 