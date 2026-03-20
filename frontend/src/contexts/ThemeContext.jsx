import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Tenta pegar o tema salvo no localStorage
        const savedTheme = localStorage.getItem("@oficina:theme");
        return savedTheme || "light"; // padrão: light
    });

    useEffect(() => {
        // Salva o tema no localStorage quando mudar
        localStorage.setItem("@oficina:theme", theme);

        // Aplica a classe no elemento html
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                isDark: theme === "dark",
                isLight: theme === "light",
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};