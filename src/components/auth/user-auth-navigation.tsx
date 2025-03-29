'use client'
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const UserAuth = () => {
    const { data: session } = useSession();
    return (
        <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session?.user ? (
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                        {session.user.name}
                    </span>
                    <Button onClick={() => signOut()}>Выйти</Button>
                </div>
            ) : (
                <Link href="/auth">
                    Войти
                </Link>
            )}
        </div>
    )
}

export default UserAuth