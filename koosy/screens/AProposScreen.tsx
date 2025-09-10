import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';

const getVersion = () => {
    return (
        Constants.manifest?.version ||
        Constants.expoConfig?.version ||
        'Version inconnue'
    );
};

const AProposScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const version = getVersion();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.logoContainer}>
                <FontAwesome5 name="key" size={70} color={colors.primary} />
                <Text style={[styles.appName, { color: colors.primary }]}>Koosy</Text>
            </View>
            <Text style={[styles.desc, { color: colors.text }]}>Koosy simplifie la gestion locative : réservation, calendrier, notifications et sécurité, tout en un.</Text>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Version</Text>
                <Text style={{ color: colors.text }}>{version}</Text>
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Contact</Text>
                <Text style={{ color: colors.text }}>Email : contact@koosyapp.com</Text>
                <Text style={{ color: colors.text }}>Site : www.koosyapp.com</Text>
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Mentions légales</Text>
                <Text style={{ color: colors.text }}>Toutes les données sont protégées et traitées selon la politique de confidentialité.</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Confidentialite')}>
                    <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Voir la politique de confidentialité</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Crédits</Text>
                <Text style={{ color: colors.text }}>Développement : Sullivankow</Text>
                <Text style={{ color: colors.text }}>Design : KoosyApp Team</Text>
            </View>
            <TouchableOpacity style={[styles.feedbackBtn, { backgroundColor: colors.primary }]} onPress={() => Linking.openURL('mailto:contact@koosyapp.com?subject=Feedback KoosyApp')}>
                <Text style={[styles.feedbackText, { color: colors.surface }]}>Envoyer un feedback</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 18,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    desc: {
        fontSize: 16,
        marginBottom: 18,
        textAlign: 'center',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    feedbackBtn: {
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
        elevation: 2,
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AProposScreen;

