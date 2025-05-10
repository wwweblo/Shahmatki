import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.attributes?.includes('admin-attributes')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const attributes = await prisma.attribute.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(attributes);
    } catch (error) {
        console.error('Error fetching attributes:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.attributes?.includes('admin-attributes')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        const attribute = await prisma.attribute.create({
            data: {
                name
            }
        });

        return NextResponse.json(attribute);
    } catch (error) {
        console.error('Error creating attribute:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// Новый эндпоинт для управления атрибутами пользователя
export async function PUT(request: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.attributes?.includes('admin-attributes')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { userId, attributeIds } = body;

        if (!userId || !Array.isArray(attributeIds)) {
            return new NextResponse('Invalid request body', { status: 400 });
        }

        // Проверяем существование пользователя
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // Обновляем связи между пользователем и атрибутами
        await prisma.user.update({
            where: { id: userId },
            data: {
                attributes: {
                    // Сначала отсоединяем все существующие атрибуты
                    disconnect: await prisma.attribute.findMany({
                        select: { id: true }
                    }),
                    // Затем присоединяем выбранные атрибуты
                    connect: attributeIds.map(id => ({ id }))
                }
            }
        });

        // Получаем обновленного пользователя с атрибутами
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                attributes: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user attributes:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}