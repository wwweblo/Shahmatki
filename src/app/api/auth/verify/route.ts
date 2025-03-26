import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { schema } from "@/lib/schema";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedCredentials = schema.parse(body);
        
        const user = await prisma.user.findFirst({
            where: {
                email: validatedCredentials.email,
                password: validatedCredentials.password
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
} 