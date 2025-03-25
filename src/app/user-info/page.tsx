import {auth} from "@/lib/auth";
import Image from "next/image";
import {SignOutButton} from "@/components/sign-out";

const UserInfo = async() => {
    const session = await auth();
    return (
        <div>
            <h1>{session?.user?.name}</h1>
            <h1>{session?.user?.email}</h1>
            {session?.user?.image && (
                <Image
                    src={session.user.image}
                    width={48}
                    height={48}
                    alt="user avatar"
                />
            )}
            <SignOutButton/>

        </div>
    )
}

export default UserInfo;