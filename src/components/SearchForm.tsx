'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';

interface SearchFormProps {
    defaultValue?: string;
}

export function SearchForm({ defaultValue = '' }: SearchFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useDebounce(defaultValue, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        router.push(`?${params.toString()}`);
    }, [search, router, searchParams]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Поиск по названию или автору..."
                defaultValue={defaultValue}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
            />
        </div>
    );
} 