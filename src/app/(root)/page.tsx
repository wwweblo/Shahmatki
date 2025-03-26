"use server"

import {auth} from "@/lib/auth";
import {GithubLogin} from "@/components/github-login";
import {SignOutButton} from "@/components/sign-out";
import EmailLogin from "@/components/email-login";

export default async function Home() {

    const session = await auth();
        return (
            <div className='w-fit bg-neutral-500 px-6 py-3'>
                {session?.user ? (
                    <>
                        <h1 className='text-foreground'>{session.user.email}</h1>
                        <SignOutButton/>
                    </>
                ): (
                    <>
                        <h1>Sign in</h1>
                        <GithubLogin />
                        <EmailLogin/>
                    </>
                    )}
            </div>
        )

}
