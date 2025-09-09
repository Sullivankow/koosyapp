import React from 'react';
import { View, Text } from 'react-native';

const PreferencesScreen: React.FC = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Préférences d’affichage</Text>
        <Text>Options de personnalisation de l’application.</Text>
    </View>
);

export default PreferencesScreen;
