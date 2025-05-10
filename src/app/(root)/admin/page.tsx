'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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

interface Attribute {
    id: string;
    name: string;
    description: string | null;
}

interface UserWithAttributes extends User {
    attributes: Attribute[];
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
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [loading, setLoading] = useState({
        users: true,
        articles: true,
        attributes: true
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
    const [newAttribute, setNewAttribute] = useState<{name: string, description: string}>({
        name: '',
        description: ''
    });

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
                    setAttributes(attributes); // Добавляем эту строку
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

    const handleAttributeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/attributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAttribute),
            });

            if (response.ok) {
                const createdAttribute = await response.json();
                setAttributes([...attributes, createdAttribute]);
                setNewAttribute({ name: '', description: '' });
            }
        } catch (error) {
            console.error("Error creating attribute:", error);
        }
    };

    const handleAttributeUpdate = async (id: string) => {
        if (!editingAttribute) return;
        
        try {
            const response = await fetch(`/api/admin/attributes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingAttribute),
            });

            if (response.ok) {
                setAttributes(attributes.map(attr => 
                    attr.id === id ? editingAttribute : attr
                ));
                setEditingAttribute(null);
            }
        } catch (error) {
            console.error("Error updating attribute:", error);
        }
    };

    const handleAttributeDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/attributes/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAttributes(attributes.filter(attr => attr.id !== id));
            }
        } catch (error) {
            console.error("Error deleting attribute:", error);
        }
    };

    const renderAttributesContent = () => {
        if (loading.attributes) {
            return <p>Загрузка атрибутов...</p>;
        }

        return (
            <div className="space-y-6">
                <form onSubmit={handleAttributeSubmit} className="space-y-4 border p-4 rounded">
                    <h3 className="font-bold">Добавить новый атрибут</h3>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Название атрибута"
                            className="px-3 py-2 border rounded-md w-full"
                            value={newAttribute.name}
                            onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Описание"
                            className="px-3 py-2 border rounded-md w-full"
                            value={newAttribute.description}
                            onChange={(e) => setNewAttribute({...newAttribute, description: e.target.value})}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Добавить
                        </button>
                    </div>
                </form>

                <ul className="space-y-4">
                    {attributes.map(attribute => (
                        <li key={attribute.id} className="border p-4 rounded">
                            {editingAttribute?.id === attribute.id ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        className="px-3 py-2 border rounded-md w-full"
                                        value={editingAttribute.name}
                                        onChange={(e) => setEditingAttribute({
                                            ...editingAttribute,
                                            name: e.target.value
                                        })}
                                    />
                                    <input
                                        type="text"
                                        className="px-3 py-2 border rounded-md w-full"
                                        value={editingAttribute.description || ''}
                                        onChange={(e) => setEditingAttribute({
                                            ...editingAttribute,
                                            description: e.target.value
                                        })}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAttributeUpdate(attribute.id)}
                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            onClick={() => setEditingAttribute(null)}
                                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{attribute.name}</h4>
                                        <p className="text-sm text-gray-600">{attribute.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingAttribute(attribute)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleAttributeDelete(attribute.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const handleUserAttributeChange = async (userId: string, attributeId: string, isChecked: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/attributes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    attributeId,
                    action: isChecked ? 'add' : 'remove'
                }),
            });
    
            if (response.ok) {
                // Обновляем локальное состояние
                setUsers(users.map(user => {
                    if (user.id === userId) {
                        const userWithAttrs = user as UserWithAttributes;
                        const attributes = userWithAttrs.attributes || [];
                        
                        return {
                            ...user,
                            attributes: isChecked 
                                ? [...attributes, attributes.find(a => a.id === attributeId) || { id: attributeId }]
                                : attributes.filter(a => a.id !== attributeId)
                        };
                    }
                    return user;
                }));
            }
        } catch (error) {
            console.error("Ошибка при обновлении атрибутов пользователя:", error);
        }
    };

    const renderUserAttributesContent = () => {
        if (loading.users || loading.attributes) {
            return <p>Загрузка данных...</p>;
        }
    
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded p-4">
                        <h3 className="font-bold mb-4">Пользователи</h3>
                        <ul className="space-y-2">
                            {users.map(user => (
                                <li 
                                    key={user.id}
                                    className={`p-2 rounded cursor-pointer hover:bg-neutral-800 ${
                                        selectedUser === user.id ? 'bg-neutral-500' : ''
                                    }`}
                                    onClick={() => setSelectedUser(user.id)}
                                >
                                    {user.username}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="border rounded p-4">
                        <h3 className="font-bold mb-4">Атрибуты</h3>
                        {selectedUser ? (
                            <div className="space-y-2">
                                {attributes.map(attribute => {
                                    const user = users.find(u => u.id === selectedUser) as UserWithAttributes;
                                    const isChecked = user.attributes?.some(attr => attr.id === attribute.id) || false;
    
                                    return (
                                        <div key={attribute.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`attr-${attribute.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handleUserAttributeChange(
                                                    selectedUser,
                                                    attribute.id,
                                                    checked as boolean
                                                )}
                                            />
                                            <label 
                                                htmlFor={`attr-${attribute.id}`}
                                                className="text-sm font-medium text-gray-700 cursor-pointer"
                                            >
                                                {attribute.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500">Выберите пользователя слева</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="articles">Статьи</TabsTrigger>
                    <TabsTrigger value="attributes">Атрибуты</TabsTrigger>
                    <TabsTrigger value="user-attributes">Управление атрибутами</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    {renderTabContent('users')}
                </TabsContent>

                <TabsContent value="articles">
                    {renderTabContent('articles')}
                </TabsContent>

                <TabsContent value="attributes">
                    {renderAttributesContent()}
                </TabsContent>

                <TabsContent value="user-attributes">
                    {renderUserAttributesContent()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;
