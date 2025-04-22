'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        const register = searchParams.get('register');
        setIsLogin(register !== 'true');
    }, [searchParams]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const username = formData.get('username') as string;

        if (!isLogin && password !== confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error('Неверный email или пароль');
                }

                if (result?.ok) {
                    router.push('/');
                }
            } else {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, username }),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.error?.issues) {
                        // Обработка ошибок валидации Zod
                        const validationErrors = data.error.issues.map((issue: { path: string[]; message: string }) => {
                            const field = issue.path[0];
                            const message = issue.message;
                            return `${field}: ${message}`;
                        });
                        throw new Error(validationErrors.join('\n'));
                    }
                    throw new Error(data.error || 'Ошибка при регистрации');
                }

                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error('Ошибка при входе после регистрации');
                }

                if (result?.ok) {
                    router.push('/');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2>
                        {isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}
                    </h2>
                </div>
                <form className="mt-8 flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-3 p-3">
                        {!isLogin && (
                            <div>
                                <label htmlFor="username" className="sr-only">
                                    Псевдоним
                                </label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required={!isLogin}
                                    placeholder="Псевдоним"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Пароль
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required 
                                placeholder="Пароль"
                            />
                        </div>
                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">
                                    Подтвердите пароль
                                </label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required={!isLogin}
                                    placeholder="Подтвердите пароль"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="border-red-400 border-1 py-2 rounded-full text-sm text-center whitespace-pre-line">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                        </Button>
                    </div>
                </form>

                <div className="text-center">
                    <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                            const newIsLogin = !isLogin;
                            setIsLogin(newIsLogin);
                            router.push(newIsLogin ? '/auth' : '/auth?register=true');
                        }}
                    >
                        {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </Button>
                </div>
            </div>
        </div>
    );
} 