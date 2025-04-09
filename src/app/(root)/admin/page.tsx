'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
    id: string;
    username: string;
}

interface Article {
    id: string;
    title: string;
    content: string;
    author: {
        username: string;
    };
    createdAt: string;
}

// Add new interface
interface Attribute {
    id: string;
    name: string;
    description: string | null;
}

const ATTRIBUTE_REQUIREMENTS = {
    users: 'admin-users',
    articles: 'admin-articles',
    attributes: 'admin-attributes'  // Add new requirement
};

const AdminPage = () => {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState({
        users: true,
        articles: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    const userAttributes = session?.user?.attributes || [];

    const hasRequiredAttribute = (tabName: string) => {
        const requiredAttribute = ATTRIBUTE_REQUIREMENTS[tabName as keyof typeof ATTRIBUTE_REQUIREMENTS];
        return userAttributes.includes(requiredAttribute);
    };

    useEffect(() => {
        if (status === 'loading') return;

        const fetchData = async () => {
            if (hasRequiredAttribute('users')) {
                try {
                    const response = await fetch('/api/admin/users');
                    const data = await response.json();
                    setUsers(data);
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoading(prev => ({ ...prev, users: false }));
                }
            }

            if (hasRequiredAttribute('articles')) {
                try {
                    const response = await fetch('/api/articles');
                    const data = await response.json();
                    setArticles(data);
                } catch (error) {
                    console.error("Error fetching articles:", error);
                } finally {
                    setLoading(prev => ({ ...prev, articles: false }));
                }
            }

            if (hasRequiredAttribute('attributes')) {
                try {
                    const response = await fetch('/api/admin/attributes');
                    const data = await response.json();
                    const attributes = data as Attribute[];
                    
                } catch (error) {
                    console.error("Error fetching attributes:", error);
                } finally {
                    setLoading(prev => ({ ...prev, attributes: false }));
                }
            }
        };

        fetchData();
    }, [status, session]);

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    const handleDelete = async (type: 'user' | 'article', id: string) => {
        try {
            const endpoint = type === 'user' ? `/api/admin/users/${id}` : `/api/articles/${id}`;
            const response = await fetch(endpoint, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (type === 'user') {
                    setUsers(users.filter(user => user.id !== id));
                } else {
                    setArticles(articles.filter(article => article.id !== id));
                }
            }
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderTabContent = (tabName: string) => {
        if (!hasRequiredAttribute(tabName)) {
            return (
                <div className="p-4 text-red-600">
                    You don't have permission to view this section. 
                    Required attribute: {ATTRIBUTE_REQUIREMENTS[tabName as keyof typeof ATTRIBUTE_REQUIREMENTS]}
                </div>
            );
        }

        const searchPlaceholder = tabName === 'users' ? 'Search by username...' : 'Search by title...';

        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="px-3 py-2 border rounded-md w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {tabName === 'users' ? (
                    loading.users ? (
                        <p>Loading users...</p>
                    ) : (
                        <ul className="space-y-2">
                            {filteredUsers.map(user => (
                                <li key={user.id} className="p-2 border rounded flex justify-between items-center">
                                    <span>{user.username}</span>
                                    <button
                                        onClick={() => handleDelete('user', user.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    loading.articles ? (
                        <p>Loading articles...</p>
                    ) : (
                        <ul className="space-y-4">
                            {filteredArticles.map(article => (
                                <li key={article.id} className="p-4 border rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold">{article.title}</h3>
                                            <p className="text-sm text-gray-600">
                                                Author: {article.author.username}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Created: {new Date(article.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete('article', article.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )
                )}
            </div>
        );
    };

    return (
        <div className="p-4">
            <Tabs 
                defaultValue="users" 
                className="w-full max-w-3xl"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="articles">Articles</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    {renderTabContent('users')}
                </TabsContent>
                <TabsContent value="articles">
                    {renderTabContent('articles')}
                </TabsContent>
                <TabsContent value="attributes">
                    {renderTabContent('attributes')}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;
