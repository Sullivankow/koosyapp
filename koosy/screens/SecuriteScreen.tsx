import React from 'react';
import { View, Text } from 'react-native';

const SecuriteScreen: React.FC = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Sécurité</Text>
        <Text>Options de sécurité et gestion du mot de passe.</Text>
    </View>
);

export default SecuriteScreen;
