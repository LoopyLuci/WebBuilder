'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext({
    theme: 'system',
    setTheme: () => { },
    resolvedTheme: 'light',
});
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('system');
    const [resolvedTheme, setResolvedTheme] = useState('light');
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored) {
            setTheme(stored);
        }
    }, []);
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const resolved = mediaQuery.matches ? 'dark' : 'light';
                setResolvedTheme(resolved);
                root.classList.toggle('dark', resolved === 'dark');
            };
            handleChange();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        else {
            setResolvedTheme(theme);
            root.classList.toggle('dark', theme === 'dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme, resolvedTheme }, children: children }));
}
export function useTheme() {
    return useContext(ThemeContext);
}
export default ThemeProvider;
//# sourceMappingURL=theme-provider.js.map