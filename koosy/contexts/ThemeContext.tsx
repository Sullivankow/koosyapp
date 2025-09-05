import React, { createContext, useContext, useState, useEffect } from 'react';
import { LightColors, DarkColors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
    isDarkMode: false,
    colors: LightColors,
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            if (value === 'dark') setIsDarkMode(true);
            if (value === 'light') setIsDarkMode(false);
            setIsThemeLoaded(true);
        });
    }, []);

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    const colors = isDarkMode ? DarkColors : LightColors;

    const contextValue = React.useMemo(
        () => ({ isDarkMode, colors, toggleTheme }),
        [isDarkMode, colors, toggleTheme]
    );

    if (!isThemeLoaded) {
        // Affiche un écran de chargement ou rien le temps de charger le thème
        return null;
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};