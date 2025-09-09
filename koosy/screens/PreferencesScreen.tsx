import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const PreferencesScreen: React.FC = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary }}>Préférences d’affichage</Text>
            <Text style={{ color: colors.text }}>Options de personnalisation de l’application.</Text>
        </View>
    );
};

export default PreferencesScreen;
