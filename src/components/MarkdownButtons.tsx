'use client';

interface MarkdownButtonsProps {
    onInsert: (text: string) => void;
}

export function MarkdownButtons({ onInsert }: MarkdownButtonsProps) {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <button
                onClick={() => onInsert('**жирный текст**')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Жирный
            </button>
            <button
                onClick={() => onInsert('*курсив*')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Курсив
            </button>
            <button
                onClick={() => onInsert('# Заголовок')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Заголовок
            </button>
            <button
                onClick={() => onInsert('- элемент списка')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Список
            </button>
            <button
                onClick={() => onInsert('1. нумерованный список')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Нумерованный список
            </button>
            <button
                onClick={() => onInsert('> цитата')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Цитата
            </button>
            <button
                onClick={() => onInsert('`код`')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Код
            </button>
            <button
                onClick={() => onInsert('```\nкод\n```')}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
                Блок кода
            </button>
        </div>
    );
} 