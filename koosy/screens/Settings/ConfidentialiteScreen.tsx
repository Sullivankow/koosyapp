import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ConfidentialiteScreen: React.FC = () => {
    const { colors } = useTheme();
    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 30 }}>
            <Text style={[styles.title, { color: colors.primary }]}>Politique de confidentialité</Text>
            <Text style={[styles.text, { color: colors.text }]}>Votre vie privée est importante pour nous. Cette application collecte uniquement les données nécessaires au bon fonctionnement du service (gestion des réservations, notifications, sécurité, etc.).</Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>Données collectées</Text>
            <Text style={[styles.text, { color: colors.text }]}>- Informations de compte (nom, email, téléphone)
                - Informations de réservation et de gestion locative
                - Préférences utilisateur
                - Données techniques (appareil, version de l’app)
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>Utilisation des données</Text>
            <Text style={[styles.text, { color: colors.text }]}>Les données sont utilisées uniquement pour fournir et améliorer le service. Elles ne sont jamais revendues ni partagées à des tiers sans consentement.</Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>Sécurité</Text>
            <Text style={[styles.text, { color: colors.text }]}>Toutes les données sont protégées et stockées de façon sécurisée. Vous pouvez demander la suppression de votre compte et de vos données à tout moment.</Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>Contact</Text>
            <Text style={[styles.text, { color: colors.text }]}>Pour toute question sur la confidentialité, contactez-nous à contact@koosyapp.com</Text>
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
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
    },
    text: {
        fontSize: 15,
        marginBottom: 8,
        lineHeight: 22,
    },
});

export default ConfidentialiteScreen;
