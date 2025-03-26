"use client"

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.refresh();
        router.push('/');
    };

    return (
        <button
            onClick={handleSignOut}
            className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
        >
            Выйти
        </button>
    );
}

