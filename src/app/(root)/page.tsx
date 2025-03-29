import Link from 'next/link';
import { auth } from '@/lib/auth';
import ChessBoardWrapper from '@/components/chess/ChessBoardWrapper';

export default async function Home() {
    const session = await auth();

    return (
        <main className='flex flex-col items-center'>

 
            <section className='flex flex-col items-center'>
                <h2 className='border-b-1 border-neutral-500 pb-2 mb-2 text-xl'>
                    Добро пожаловать, {session?.user?.name}!
                </h2>
                <h1 className='text-3xl'>Chess</h1>
                <ChessBoardWrapper/>
            </section>


            <section className="text-center">
                <h1>
                    Добро пожаловать в сообщество
                </h1>
                <p className="pb-2 mb-2 text-xl">
                    Учитесь у других
                </p>
                <div>
                    <Link
                        href="/articles"
                        className="bg-blue-300 px-4 py-1 rounded-2xl m-3 text-black "
                    >
                        Читать статьи 📃
                    </Link>
                    {session?.user ? (
                        <Link
                            href="/articles/new"
                            className=""
                        >
                            Написать статью
                        </Link>
                    ) : (
                        <Link
                            href="/auth"
                            className=""
                        >
                            Войти, чтобы писать
                        </Link>
                    )}
                </div>
            </section>


        </main>
    );
} 