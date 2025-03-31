'use client'
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

const ToggleThemeButton = ({
  classname = 'bg-black text-white dark:bg-blue-300 dark:text-black px-4 py-1 rounded-2xl m-3'
}: {
  classname?: string
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Получаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Устанавливаем тему на основе сохраненного значения или системных предпочтений
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.body.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    setIsDarkMode(newDarkMode);
    // Сохраняем выбранную тему в localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <Button
      className={classname}
      onClick={toggleDarkMode}
    >
      Тема {isDarkMode ? '☀️' : '🌕'}
    </Button>
  );
};

export default ToggleThemeButton;