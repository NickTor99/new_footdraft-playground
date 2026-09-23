import React, { useState } from 'react';
import { Switch } from "@material-tailwind/react";
import ThemeToggle from "./components/generic/ThemeToggle.jsx";

export default function Config(){
    const [mode, setMode] = useState(localStorage.theme)
    const toggleDarkMode = () => {
        const html = document.documentElement

        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light'); // Salva preferenza
            setMode('light')
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark'); // Salva preferenza
            setMode('dark')
        }
    };
    return(

        <div className={'flex justify-center items-center h-full'}>
            <span className={'font-bold dark:text-white text-4xl'}>Modifica il tema</span>
            <div className={'w-3'}></div>
            <ThemeToggle mode={mode} toggleDarkMode={toggleDarkMode} />
        </div>

    )
}