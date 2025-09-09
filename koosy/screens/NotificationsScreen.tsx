import React from 'react';
import { View, Text } from 'react-native';

const NotificationsScreen: React.FC = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Notifications</Text>
        <Text>Paramètres de notifications et alertes.</Text>
    </View>
);

export default NotificationsScreen;
