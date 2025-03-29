import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";


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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
