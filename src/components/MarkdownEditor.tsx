'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bold, Italic, List, ListOrdered, Quote, Code, Heading1, Heading2, Link, Image } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export function MarkdownEditor({ value, onChange, label }: MarkdownEditorProps) {
    const [isPreview, setIsPreview] = useState(false);

    const insertMarkdown = (markdown: string) => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText = value.substring(0, start) + markdown + selectedText + value.substring(end);
        onChange(newText);

        // Устанавливаем курсор после вставленного markdown
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + markdown.length, end + markdown.length);
        }, 0);
    };

    const buttons = [
        { icon: <Bold className="w-4 h-4" />, markdown: '**', title: 'Жирный текст' },
        { icon: <Italic className="w-4 h-4" />, markdown: '*', title: 'Курсив' },
        { icon: <Heading1 className="w-4 h-4" />, markdown: '# ', title: 'Заголовок 1' },
        { icon: <Heading2 className="w-4 h-4" />, markdown: '## ', title: 'Заголовок 2' },
        { icon: <List className="w-4 h-4" />, markdown: '- ', title: 'Маркированный список' },
        { icon: <ListOrdered className="w-4 h-4" />, markdown: '1. ', title: 'Нумерованный список' },
        { icon: <Quote className="w-4 h-4" />, markdown: '> ', title: 'Цитата' },
        { icon: <Code className="w-4 h-4" />, markdown: '```\n\n```', title: 'Код' },
        { icon: <Link className="w-4 h-4" />, markdown: '[текст](url)', title: 'Ссылка' },
        { icon: <Image className="w-4 h-4" />, markdown: '![alt](url)', title: 'Изображение' },
    ];

    return (
        <div className="space-y-4">
            {label && <Label>{label}</Label>}
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted">
                {buttons.map((button, index) => (
                    <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        onClick={() => insertMarkdown(button.markdown)}
                        title={button.title}
                    >
                        {button.icon}
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    onClick={() => setIsPreview(!isPreview)}
                    className="ml-auto"
                >
                    {isPreview ? 'Редактировать' : 'Предпросмотр'}
                </Button>
            </div>
            {isPreview ? (
                <div className="prose prose-sm max-w-none p-4 border rounded-md">
                    <ReactMarkdown>{value}</ReactMarkdown>
                </div>
            ) : (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[200px] font-mono"
                    placeholder="Введите текст с поддержкой Markdown..."
                />
            )}
        </div>
    );
} 