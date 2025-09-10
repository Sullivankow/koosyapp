import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type MaterialCommunityIconName =
    | "account-circle"
    | "theme-light-dark"
    | "bell"
    | "shield-lock"
    | "information"
    | "help-circle";

const sections: { label: string; icon: MaterialCommunityIconName }[] = [
    { label: 'Profil utilisateur', icon: 'account-circle' },
    { label: 'Notifications', icon: 'bell' },
    { label: 'Sécurité', icon: 'shield-lock' },
    { label: 'À propos', icon: 'information' },
    { label: 'Support & Aide', icon: 'help-circle' },
];

type ParametresStackParamList = {
    Parametres: undefined;
    Profil: undefined;
    Preferences: undefined;
    Notifications: undefined;
    Securite: undefined;
    APropos: undefined;
    Support: undefined;
};

const ParametresScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<StackNavigationProp<ParametresStackParamList>>();

    // Mapping entre label et nom de route
    const routeMap: { [key: string]: string } = {
        'Profil utilisateur': 'Profil',
        'Notifications': 'Notifications',
        'Sécurité': 'Securite',
        'À propos': 'APropos',
        'Support & Aide': 'Support',
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Paramètres</Text>
            {sections.map((section, idx) => (
                <TouchableOpacity key={idx} style={[styles.sectionBtn, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate({ name: routeMap[section.label] as keyof ParametresStackParamList, params: undefined })}>
                    <MaterialCommunityIcons name={section.icon} size={24} color={colors.primary} style={{ marginRight: 12 }} />
                    <Text style={{ color: colors.text, fontSize: 17 }}>{section.label}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 18,
    },
    sectionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        elevation: 2,
    },
});

export default ParametresScreen;
