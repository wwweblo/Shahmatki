import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
    const session = await auth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Добро пожаловать в блог
                </h1>
                <p className="text-xl text-gray-500 mb-8">
                    Здесь вы можете читать и создавать интересные статьи
                </p>
                <div className="space-x-4">
                    <Link
                        href="/articles"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Читать статьи
                    </Link>
                    {session?.user ? (
                        <Link
                            href="/articles/new"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 border-indigo-600"
                        >
                            Написать статью
                        </Link>
                    ) : (
                        <Link
                            href="/auth"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 border-indigo-600"
                        >
                            Войти, чтобы писать
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
} 