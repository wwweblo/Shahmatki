import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { schema } from "@/lib/schema";
import { v4 as uuid } from "uuid";
import { encode } from "@auth/core/jwt";

export const { auth, handlers, signOut, signIn } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        GitHub,
        Credentials({
            credentials: {
                email: { label: "Email", type: "text", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const validatedCredentials = schema.parse(credentials);
                // Здесь будет логика проверки через API
                const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(validatedCredentials)
                });
                
                if (!response.ok) return null;
                return response.json();
            }
        })
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account?.provider === 'credentials') {
                token.credentials = true;
            }
            return token;
        }
    },
    jwt: {
        encode: async function (params) {
            if (params.token?.credentials) {
                const sessionToken = uuid();
                return sessionToken;
            }
            return encode(params);
        }
    }
}); 