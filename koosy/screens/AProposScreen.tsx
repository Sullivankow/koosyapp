import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const AProposScreen: React.FC = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary }}>À propos</Text>
            <Text style={{ color: colors.text }}>Informations sur l’application et l’équipe.</Text>
        </View>
    );
};

export default AProposScreen;
