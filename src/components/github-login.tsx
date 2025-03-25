"use client"
import {login} from "@/lib/actions/auth";

const GithubLogin = () => {
    return(
        <button onClick={login}>
            Sign in with Github
        </button>
    )
}
export {GithubLogin}

