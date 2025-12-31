import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>(
        (localStorage.getItem('theme') as ThemeType) || 'light'
    );

    const applyTheme = (themeValue: ThemeType) => {
        const htmlElement = document.documentElement;
        if (themeValue === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    };

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    // Apply theme khi component mount
    useEffect(() => {
        applyTheme(theme);
    }, []);

    // Apply theme khi state thay đổi
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};