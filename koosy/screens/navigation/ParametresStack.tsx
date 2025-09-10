import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ParametresScreen from '../ParametresScreen';
import ProfilScreen from '../ProfilScreen';
import PreferencesScreen from '../PreferencesScreen';
import NotificationsScreen from '../NotificationsScreen';
import SecuriteScreen from '../SecuriteScreen';
import AProposScreen from '../AProposScreen';
import ConfidentialiteScreen from '../ConfidentialiteScreen';

const Stack = createStackNavigator();

const ParametresStack: React.FC = () => (
    <Stack.Navigator>
        <Stack.Screen name="Parametres" component={ParametresScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profil" component={ProfilScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Securite" component={SecuriteScreen} />
        <Stack.Screen name="APropos" component={AProposScreen} />
        <Stack.Screen name="Confidentialite" component={ConfidentialiteScreen} />
    </Stack.Navigator>
);

export default ParametresStack;
