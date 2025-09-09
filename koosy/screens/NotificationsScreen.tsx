import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const NotificationsScreen: React.FC = () => {
    const { colors } = useTheme();
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary }}>Notifications</Text>
            <Text style={{ color: colors.text }}>Paramètres de notifications et alertes.</Text>
        </View>
    );
};

export default NotificationsScreen;
