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