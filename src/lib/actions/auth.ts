"use server"

import {signIn, signOut} from "@/lib/auth";

export const login = async () =>{
    await signIn('github', {redirectTo:'/'});
}

export const logout = async () =>{
    await signOut({redirectTo:'/'});
}