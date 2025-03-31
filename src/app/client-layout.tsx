'use client'

import { useEffect } from 'react'
import { AuthProvider } from "@/components/auth/auth-provider";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Проверяем сохраненную тему при загрузке приложения
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Устанавливаем тему на основе сохраненного значения или системных предпочтений
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark')
    }
  }, [])

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 