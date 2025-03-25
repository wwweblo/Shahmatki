"use client"
import {logout} from "@/lib/actions/auth";

const SignOutButton = () => {
    return(
        <button onClick={logout}>
            Signout
        </button>
    )
}
export {SignOutButton}

