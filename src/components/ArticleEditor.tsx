'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { EditButtons } from './EditButtons';

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
    onSave: (content: string) => void;
    onCancel: () => void;
}

export function ArticleEditor({ article, isAuthor, onSave, onCancel }: ArticleEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(article.content);
    const [isPreview, setIsPreview] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        onSave(editedContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(article.content);
        setIsEditing(false);
        onCancel();
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

    const insertMarkdown = (markdown: string) => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = editedContent.substring(start, end);
        
        let newText = editedContent;
        if (selectedText) {
            newText = editedContent.substring(0, start) + markdown.replace('$1', selectedText) + editedContent.substring(end);
        } else {
            newText = editedContent.substring(0, start) + markdown + editedContent.substring(start);
        }

        setEditedContent(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + markdown.length, start + markdown.length);
        }, 0);
    };

    if (isEditing) {
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => insertMarkdown('**$1**')}
                        title="Жирный текст"
                        variant="outline"
                        size="sm"
                    >
                        B
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('*$1*')}
                        title="Курсив"
                        variant="outline"
                        size="sm"
                    >
                        I
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('# $1')}
                        title="Заголовок"
                        variant="outline"
                        size="sm"
                    >
                        H1
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('## $1')}
                        title="Подзаголовок"
                        variant="outline"
                        size="sm"
                    >
                        H2
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('- $1')}
                        title="Список"
                        variant="outline"
                        size="sm"
                    >
                        • List
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('1. $1')}
                        title="Нумерованный список"
                        variant="outline"
                        size="sm"
                    >
                        1. List
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('> $1')}
                        title="Цитата"
                        variant="outline"
                        size="sm"
                    >
                        {'>'} Quote
                    </Button>
                    <Button
                        onClick={() => insertMarkdown('`$1`')}
                        title="Код"
                        variant="outline"
                        size="sm"
                    >
                        Code
                    </Button>
                    <Button
                        onClick={() => setIsPreview(!isPreview)}
                        variant="outline"
                        size="sm"
                        className="bg-blue-300 text-foreground"
                    >
                        {isPreview ? 'Редактировать' : 'Предпросмотр'}
                    </Button>
                </div>

                {isPreview ? (
                    <div className="prose max-w-none p-4 border rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {editedContent}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-64 p-4 border rounded"
                    />
                )}

                <EditButtons
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isEditing={isEditing}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-star">
                <div className='flex flex-col gap-3'>
                    <Link
                        href="/articles"
                        className="bg-blue-300 text-background px-2 py-1 rounded-full w-fit mr-2"
                    >
                        ← Назад к списку
                    </Link>
                    <h1>{article.title}</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Автор:{' '}
                        <Link
                            href={`/authors/${article.author.id}`}
                            className="text-blue-300 hover:underline"
                        >
                            {article.author.email || 'Аноним'}
                        </Link>{' '}
                        • {new Date(article.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                </div>
                <div className="flex space-x-2">
                    {isAuthor && (
                        <>
                            <Button
                                onClick={handleEdit}
                            >
                                Редактировать
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                            >
                                Удалить
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {editedContent}
                </ReactMarkdown>
            </div>
        </div>
    );
} 