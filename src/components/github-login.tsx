"use client"
import {login} from "@/lib/actions/git-auth";
import {Github} from "lucide-react";

const GithubLogin = () => {
    return(
        <button onClick={login} className="flex flex-row gap-2">
            <Github color={"white"}/>
            Sign in with Github
        </button>
    )
}
export {GithubLogin}

