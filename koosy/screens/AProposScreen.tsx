import React from 'react';
import { View, Text } from 'react-native';

const AProposScreen: React.FC = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>À propos</Text>
        <Text>Informations sur l’application et l’équipe.</Text>
    </View>
);

export default AProposScreen;
