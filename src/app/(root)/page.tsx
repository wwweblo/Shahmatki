import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription, CardHeader, CardFooter} from '@/components/ui/card';

export default async function Home() {
    const session = await auth();

    return (
        <main className='flex flex-col items-center gap-4'>
 
            <section className='flex flex-col items-center'>
                <Card className='p-3 items-center gap-2'>
                    <h2 className='border-b-1 border-neutral-500 pb-2 text-xl'>
                        Добро пожаловать, {session?.user?.name}!
                    </h2>
                    <h1 className='text-3xl'>Chess</h1>
                </Card>
            </section>

            <section className='grid grid-cols-2 gap-4'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-2xl leading-none'>
                            Добро пожаловать в сообщество
                        </CardTitle>
                        <CardDescription>
                            Учитесь у других
                        </CardDescription>
                        </CardHeader>
                        <CardFooter className='flex flex-col gap-2'>
                            <Button variant="link" className='bg-blue-300 text-background'>
                                <Link href='/articles'>Читать статьи</Link> 
                            </Button>
                            {session?.user ? (
                                <Button variant="link"
                                >
                                    <Link href='/articles/new'>Написать статью</Link>
                                </Button>
                            ) : (
                                <Button
                                >
                                    <Link href='/auth'>Войти, чтобы писать</Link>
                                </Button>
                            )}
                        </CardFooter>
                    
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-2xl leading-none'>
                            Практикуй свои навыки
                        </CardTitle>
                        <CardDescription>
                            Закрепи знания 
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className='flex flex-col gap-2'>
                        <Button variant="link" className='bg-blue-300 text-background'>
                            <Link href='/play/bot'>Играть с ботом</Link> 
                        </Button>
                        <Button variant="link" className='bg-blue-300 text-background'>
                            <Link href='/play/online'>Играть с другом</Link> 
                        </Button>
                        
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-2xl leading-none'>
                            Узнайте больше о опзиции
                        </CardTitle>
                        <CardDescription>
                            Ее название и оценка 
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className='flex flex-col gap-2'>
                        <Button variant="link" className='bg-blue-300 text-background'>
                            <Link href='/analisis'>Оценить позицию</Link> 
                        </Button>
                    </CardFooter>
                </Card>
            </section>
        </main>
    );
} 