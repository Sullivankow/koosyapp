import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type MaterialCommunityIconName =
  | "account-circle"
  | "theme-light-dark"
  | "bell"
  | "shield-lock"
  | "information";

const sections: { label: string; icon: MaterialCommunityIconName }[] = [
    { label: 'Profil utilisateur', icon: 'account-circle' },
    { label: 'Préférences d’affichage', icon: 'theme-light-dark' },
    { label: 'Notifications', icon: 'bell' },
    { label: 'Sécurité', icon: 'shield-lock' },
    { label: 'À propos', icon: 'information' },
];

const ParametresScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}> 
            <Text style={[styles.title, { color: colors.primary }]}>Paramètres</Text>
            {sections.map((section, idx) => (
                <TouchableOpacity key={idx} style={[styles.sectionBtn, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate(section.label)}>
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
