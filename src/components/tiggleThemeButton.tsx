'use client'
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

const ToggleThemeButton = ({classname = 'bg-black text-white dark:bg-blue-300 dark:text-black px-4 py-1 rounded-2xl m-3'}:
    {classname?: string}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Sync state with the actual class on the body element
    setIsDarkMode(document.body.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
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