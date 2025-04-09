'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface User {
    id: string;
    username: string;
}

const REQUIRED_ATTRIBUTES = ['admin-users', 'admin-attributes', 'admin-articles'];

const AdminPage = () => {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        // Check if user has required attributes
        const userAttributes = session?.user?.attributes || [];
        const hasRequiredAttributes = REQUIRED_ATTRIBUTES.every(attr => 
            userAttributes.includes(attr)
        );

        if (!hasRequiredAttributes) {
            redirect('/');
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [status, session]);

    // Show loading state while checking session
    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="account">Пользователи</TabsTrigger>
                    <TabsTrigger value="password">Статьи</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    {loading ? (
                        <p>Загрузка пользователей...</p>
                    ) : (
                        <ul>
                            {users.map(user => (
                                <li key={user.id}>{user.username}</li>
                            ))}
                        </ul>
                    )}
                </TabsContent>
                <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;