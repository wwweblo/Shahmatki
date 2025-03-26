import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out";

export default async function MainPage() {
    const session = await auth();

    if (!session) {
        redirect('/auth');
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Добро пожаловать, {session.user?.email}!
                        </h1>
                        <SignOutButton />
                    </div>
                    <div className="mt-6">
                        <p className="text-gray-600">
                            Это ваша главная страница. Здесь вы можете добавить любой контент.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 