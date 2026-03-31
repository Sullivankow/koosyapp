import React, { createContext, useContext, useState, useEffect } from 'react';
import { LightColors, DarkColors, BlueGreenPalette, RedPalette, PinkPalette, GreenVioletPalette, OrangePalette } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexte pour gérer le thème clair/sombre et exposer la palette de couleurs
const ThemeContext = createContext({
    isDarkMode: false,
    colors: LightColors,
    toggleTheme: () => {},
    setPalette: (palette: string) => {},
});

// Hook utilitaire pour consommer facilement le contexte de thème
export const useTheme = () => useContext(ThemeContext);

// Provider qui charge le thème sauvegardé et fournit les couleurs / fonctions aux enfants
export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);
    // Palette dynamique
    const [palette, setPaletteState] = useState<'bluegreen' | 'red' | 'pink' | 'greenviolet' | 'orange'>('bluegreen');

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            if (value === 'dark') setIsDarkMode(true);
            if (value === 'light') setIsDarkMode(false);
            setIsThemeLoaded(true);
        });
        AsyncStorage.getItem('palette').then((value) => {
            if (value === 'red') setPaletteState('red');
            else if (value === 'pink') setPaletteState('pink');
            else if (value === 'greenviolet') setPaletteState('greenviolet');
            else if (value === 'orange') setPaletteState('orange');
            else setPaletteState('bluegreen');
        });
    }, []);

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    // Fonction pour changer la palette globale
    const setPalette = (paletteName: string) => {
        let newPalette: typeof palette = 'bluegreen';
        if (paletteName === 'red') newPalette = 'red';
        else if (paletteName === 'pink') newPalette = 'pink';
        else if (paletteName === 'greenviolet') newPalette = 'greenviolet';
        else if (paletteName === 'orange') newPalette = 'orange';
        setPaletteState(newPalette);
        AsyncStorage.setItem('palette', newPalette);
    };

    // Choix de la palette de couleurs en fonction du mode et du choix utilisateur
    let colors;
    if (isDarkMode) {
        colors = DarkColors;
    } else {
        switch (palette) {
            case 'red':
                colors = RedPalette;
                break;
            case 'pink':
                colors = PinkPalette;
                break;
            case 'greenviolet':
                colors = GreenVioletPalette;
                break;
            case 'orange':
                colors = OrangePalette;
                break;
            default:
                colors = BlueGreenPalette;
        }
    }

    const contextValue = React.useMemo(
        () => ({ isDarkMode, colors, toggleTheme, setPalette }),
        [isDarkMode, colors, toggleTheme, setPalette]
    );

    if (!isThemeLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};