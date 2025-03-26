import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { schema } from "@/lib/schema";

export const { auth, handlers, signOut, signIn } = NextAuth({
    adapter: PrismaAdapter(prisma),
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
                    const validatedCredentials = schema.parse(credentials);
                    const user = await prisma.user.findFirst({
                        where: {
                            email: validatedCredentials.email,
                            password: validatedCredentials.password
                        }
                    });

                    if (!user) {
                        throw new Error('Неверный email или пароль');
                    }

                    return user;
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    }
});