import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { loginSchema } from "@/lib/schema";

if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not defined");
}

interface User {
    id: string;
    email: string;
    username: string;
    password: string;
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
        }
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as User).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.username as string;
            }
            return session;
        }
    }
});