import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.attributes?.includes('admin-users')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const users = await prisma.user.findMany({
            include: {
                attributes: true
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        
        if (!session?.user?.attributes?.includes('admin-users')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await prisma.user.delete({
            where: {
                id: params.id
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}