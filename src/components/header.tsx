import Link from 'next/link';
import Navigation from './navigation-button';
import UserAuth from '@/components/auth/user-auth-navigation';

export default function Header() {
    const articlesNavigation =[
        {title: 'Читать', link: '/articles' },
        {title: 'Написать', link: '/articles/new' },
    ]

    return (
        <header className="flex p-2 shadow">

            <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                    Мой блог
                </Link>
            </div>

            <nav className='w-full flex justify-between'>
                <div className="flex">
                    <Navigation title='Статьи' elements={articlesNavigation}/>
                </div>

                {/* User Login */}
                <UserAuth/>
            </nav>
            
        </header>
    );
} 