import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const SecuriteScreen: React.FC = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary }}>Sécurité</Text>
            <Text style={{ color: colors.text }}>Options de sécurité et gestion du mot de passe.</Text>
        </View>
    );
};

export default SecuriteScreen;
