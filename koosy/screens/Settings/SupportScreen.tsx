// Écran de support et aide.
// Regroupe une mini FAQ et les moyens de contacter l'équipe Koosy.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';

const SupportScreen: React.FC = () => {
    const { colors } = useTheme();
    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.header}>
                <FontAwesome5 name="question-circle" size={50} color={colors.primary} />
                <Text style={[styles.title, { color: colors.primary }]}>Support & Aide</Text>
            </View>
            <Text style={[styles.text, { color: colors.text }]}>Retrouvez ici les réponses aux questions fréquentes et les moyens de contacter l’équipe KoosyApp.</Text>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>FAQ</Text>
                <Text style={[styles.text, { color: colors.text }]}>• Comment créer un compte ?
                    • Comment réserver un bien ?
                    • Comment modifier mes informations ?
                    • Comment activer la double authentification ?
                    • Comment supprimer mon compte ?</Text>
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Contact support</Text>
                <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:contact@koosyapp.com?subject=Support KoosyApp')}>
                    <Text style={{ color: colors.surface, fontWeight: 'bold' }}>Envoyer un email</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Documentation</Text>
                <Text style={[styles.text, { color: colors.text }]}>Pour plus d’informations, consultez la documentation ou contactez-nous.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
    },
    header: {
        alignItems: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 8,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    text: {
        fontSize: 15,
        marginBottom: 8,
        lineHeight: 22,
    },
    contactBtn: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
});

export default SupportScreen;
