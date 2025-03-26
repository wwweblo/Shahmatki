declare module 'react-markdown' {
    import { ReactNode } from 'react';

    interface ReactMarkdownProps {
        children: string;
        remarkPlugins?: any[];
        components?: Record<string, any>;
    }

    export default function ReactMarkdown(props: ReactMarkdownProps): ReactNode;
}

declare module 'remark-gfm' {
    const remarkGfm: any;
    export default remarkGfm;
} 