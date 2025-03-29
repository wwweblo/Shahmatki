'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">500</h1>
                <p className="text-xl text-gray-500 mb-8">
                    Произошла ошибка на сервере
                </p>
                <div className="space-x-4">
                    <button
                        onClick={reset}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Попробовать снова
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 hover:border-indigo-600"
                    >
                        Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    );
} 