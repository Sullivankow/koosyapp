import React, { createContext, useContext, useState, useEffect } from 'react';
import { LightColors, DarkColors, BlueGreenPalette, RedPalette, PinkPalette, GreenVioletPalette, OrangePalette, PastelBluePalette, SunnyYellowPalette, UrbanGreyPalette } from '../constants/Colors';
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
    const [palette, setPaletteState] = useState<'bluegreen' | 'red' | 'pink' | 'greenviolet' | 'orange' | 'pastelblue' | 'sunnyyellow' | 'urbangrey'>('bluegreen');

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
            else if (value === 'pastelblue') setPaletteState('pastelblue');
            else if (value === 'sunnyyellow') setPaletteState('sunnyyellow');
            else if (value === 'urbangrey') setPaletteState('urbangrey');
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
        else if (paletteName === 'pastelblue') newPalette = 'pastelblue';
        else if (paletteName === 'sunnyyellow') newPalette = 'sunnyyellow';
        else if (paletteName === 'urbangrey') newPalette = 'urbangrey';
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
            case 'pastelblue':
                colors = PastelBluePalette;
                break;
            case 'sunnyyellow':
                colors = SunnyYellowPalette;
                break;
            case 'urbangrey':
                colors = UrbanGreyPalette;
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