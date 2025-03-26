'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Article {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        email: string | null;
    };
}

interface ArticleEditorProps {
    article: Article;
    isAuthor: boolean;
}

export function ArticleEditor({ article, isAuthor }: ArticleEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(article.title);
    const [content, setContent] = useState(article.content);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/articles/${article.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (response.ok) {
                setIsEditing(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating article:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Вы уверены, что хотите удалить эту статью?')) {
            try {
                const response = await fetch(`/api/articles/${article.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    window.location.href = '/articles';
                }
            } catch (error) {
                console.error('Error deleting article:', error);
            }
        }
    };

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Заголовок
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Содержание
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={20}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                    >
                        Сохранить
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
                    <p className="mt-2 text-sm text-gray-500">
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
                <div className="flex space-x-2">
                    <Link
                        href="/articles"
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        ← Назад к списку
                    </Link>
                    {isAuthor && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={handleDelete}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Удалить
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content}
                </ReactMarkdown>
            </div>
        </div>
    );
} 