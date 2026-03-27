import React, { createContext, useContext, useState, useEffect } from 'react';
import { LightColors, DarkColors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexte pour gérer le thème clair/sombre et exposer la palette de couleurs
const ThemeContext = createContext({
    // Indique si le thème sombre est activé
    isDarkMode: false,
    // Palette de couleurs actuellement utilisée dans l'application
    colors: LightColors,
    // Fonction permettant de basculer entre thème clair et sombre
    toggleTheme: () => { },
});

// Hook utilitaire pour consommer facilement le contexte de thème
export const useTheme = () => useContext(ThemeContext);

// Provider qui charge le thème sauvegardé et fournit les couleurs / fonctions aux enfants
export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    // État indiquant si le thème sombre est actif ou non
    const [isDarkMode, setIsDarkMode] = useState(false);
    // Indique si le thème a été chargé depuis le stockage (pour éviter les flashs)
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    // Au montage, on récupère la préférence de thème stockée dans AsyncStorage
    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            if (value === 'dark') setIsDarkMode(true);
            if (value === 'light') setIsDarkMode(false);
            setIsThemeLoaded(true);
        });
    }, []);

    // Bascule entre thème clair et sombre et sauvegarde le choix dans AsyncStorage
    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    // Choix de la palette de couleurs en fonction du mode actuel
    const colors = isDarkMode ? DarkColors : LightColors;

    // Valeur mémoïsée pour éviter des recalculs/re-rendus inutiles
    const contextValue = React.useMemo(
        () => ({ isDarkMode, colors, toggleTheme }),
        [isDarkMode, colors, toggleTheme]
    );

    if (!isThemeLoaded) {
        // Tant que le thème n'est pas chargé, on n'affiche rien (ou on pourrait afficher un splash)
        return null;
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};