import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { loginSchema } from "@/lib/schema";
import type { JWT } from "next-auth/jwt";

if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not defined");
}

interface User {
    id: string;
    email: string;
    username: string;
    password: string;
    attributes?: {
        name: string;
    }[];
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            attributes: string[];
        }
    }
}

// Update the JWT interface augmentation
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        attributes: string[];
    }
}

export const { auth, handlers, signOut, signIn } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    providers: [
        GitHub,
        Credentials({
            credentials: {
                email: { label: "Email", type: "text", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Введите email и пароль');
                }

                try {
                    const validatedCredentials = loginSchema.parse(credentials);
                    const user = await prisma.user.findFirst({
                        where: {
                            email: validatedCredentials.email,
                            password: validatedCredentials.password
                        },
                        include: {
                            attributes: true
                        }
                    });

                    if (!user) {
                        throw new Error('Неверный email или пароль');
                    }

                    return user as User;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/auth',
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user, account, trigger }) {
            // Always fetch fresh user data with attributes
            const dbUser = await prisma.user.findUnique({
                where: { 
                    id: user?.id || token.id 
                },
                include: {
                    attributes: true
                }
            });

            if (dbUser) {
                token.id = dbUser.id;
                token.username = dbUser.username || '';
                token.attributes = dbUser.attributes.map(attr => attr.name);
                console.log('JWT Debug: Fresh attributes loaded', {
                    userId: dbUser.id,
                    attributes: token.attributes
                });
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.username as string;
                session.user.attributes = Array.isArray(token.attributes) ? token.attributes : [];
            }
            return session;
        }
    }
});