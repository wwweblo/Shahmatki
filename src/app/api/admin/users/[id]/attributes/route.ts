// app/api/admin/users/[id]/attributes/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        
        if (!session?.user?.attributes?.includes('admin-users')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { attributeId, action } = await request.json();

        if (action === 'add') {
            await prisma.user.update({
                where: { id: params.id },
                data: {
                    attributes: {
                        connect: { id: attributeId }
                    }
                }
            });
        } else if (action === 'remove') {
            await prisma.user.update({
                where: { id: params.id },
                data: {
                    attributes: {
                        disconnect: { id: attributeId }
                    }
                }
            });
        }

        // Возвращаем обновленного пользователя
        const updatedUser = await prisma.user.findUnique({
            where: { id: params.id },
            include: { attributes: true }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user attributes:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}