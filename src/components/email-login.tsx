"use client"

import { useState } from "react";
import signUp from '@/lib/actions/email-auth';
import Link from 'next/link';

const EmailLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // предотвращаем перезагрузку страницы
        signUp({ email, password });
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
                <h2>via email</h2>
                <input
                    type='text'
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='email'
                    className='bg-white rounded px-2'
                    value={email}
                />
                <input
                    type='password'
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='password'
                    className='bg-white rounded px-2'
                    value={password}
                />
                <button type="submit" onClick={() => console.log(email, password)}>Submit</button>
            </form>
            <Link href="/register" className="text-indigo-600 hover:text-indigo-500 text-sm">
                Нет аккаунта? Зарегистрироваться
            </Link>
        </div>
    );
}

export default EmailLogin;