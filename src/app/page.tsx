"use server"

import {auth} from "@/lib/auth";
import {GithubLogin} from "@/components/github-login";
import {SignOutButton} from "@/components/sign-out";

export default async function Home() {

    const session = await auth();
    if (session?.user) {
        return (
            <>
                <h1>{session.user.name}</h1>
                <SignOutButton/>
            </>
        )
    }
  return (
    <div>
      <p>You are not signed in</p>
        <GithubLogin />
    </div>
  );
}
