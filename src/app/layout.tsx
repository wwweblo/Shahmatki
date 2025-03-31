import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeScript } from './theme-script'
import { ClientLayout } from './client-layout'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth App",
  description: "Authentication application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
