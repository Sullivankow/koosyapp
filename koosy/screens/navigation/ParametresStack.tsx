import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ParametresScreen from '../Layout/ParametresScreen';
import ProfilScreen from '../Settings/ProfilScreen';
import NotificationsScreen from '../Settings/NotificationsSettingsScreen';
import SecuriteScreen from '../Settings/SecuriteScreen';
import AProposScreen from '../Settings/AProposScreen';
import ConfidentialiteScreen from '../Settings/ConfidentialiteScreen';
import SupportScreen from '../Settings/SupportScreen';
import ThemeScreen from '../Settings/themeScreen';

const Stack = createStackNavigator();

const ParametresStack: React.FC = () => (
    <Stack.Navigator>
        <Stack.Screen name="Parametres" component={ParametresScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profil" component={ProfilScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Securite" component={SecuriteScreen} />
        <Stack.Screen name="APropos" component={AProposScreen} options={{ title: 'À propos' }} />
        <Stack.Screen name="Confidentialite" component={ConfidentialiteScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Theme" component={ThemeScreen} />
    </Stack.Navigator>
);

export default ParametresStack;
