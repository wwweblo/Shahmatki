import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): [T, (value: T) => void] {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const [setValue] = useState<[(value: T) => void]>([(value: T) => setDebouncedValue(value)]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return [debouncedValue, setValue[0]];
} 