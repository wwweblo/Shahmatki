import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "@auth/core/providers/credentials";

export const {auth, handlers, signOut, signIn} = NextAuth({
    providers: [GitHub],
})