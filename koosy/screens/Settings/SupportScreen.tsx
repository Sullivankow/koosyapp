// Écran de support et aide.
// Regroupe une mini FAQ et les moyens de contacter l'équipe Koosy.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import FAQAccordion, { FAQItem } from '../../components/FAQAccordion';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';

const SupportScreen: React.FC = () => {
    const { colors } = useTheme();
    // FAQ data
    const faqData: FAQItem[] = [
        {
            question: 'Comment créer une prestation ?',
            answer: 'Pour créer une prestation, assurez-vous d\'avoir le bien de votre intervention enregistré dans la page des "Biens". Ensuite, rendez-vous sur la page "Prestations" et cliquer sur "Ajouter une prestation"',
        },
        {
            question: 'Comment créer un bien ?',
            answer: 'Pour créer un bien, assurez-vous d\'avoir créé au préalable un client propriétaire dans la page "Propriétaires". Ensuite, rendez-vous sur la page "Biens" et cliquer sur "Ajouter un bien"',
        },
        {
            question: 'Comment créer un client propriétaire ?',
            answer: 'Créer un propriétaire est la première étape avant de créer le bien où vous intervenez. Pour cela, rendez-vous sur la page "Propriétaires" et cliquez sur "Ajouter un propriétaire".',
        },
        {
            question: 'Comment créer un devis ?',
            answer: 'Pour créer un devis, vous devez enregistrer au préalable, vos informations entreprise dans les paramètres utilisateurs afin que les informations soient automatiquement incluses dans vos devis. Puis, rendez-vous sur la page "Mes Devis" et cliquer sur "Ajouter un devis"',
        },
          {
            question: 'Comment créer une facture?',
            answer: 'Pour créer un devis, vous devez enregistrer au préalable, vos informations entreprise dans les paramètres utilisateurs afin que les informations soient automatiquement incluses dans vos devis. Puis, rendez-vous sur la page "Mes Factures" et cliquer sur "Ajouter une facture"',
        },
        {
            question: 'Comment supprimer mon compte ?',
            answer: 'Pour supprimer votre compte, il vous suffit de vous rendre dans les paramètres utilisateurs, puis de cliquer sur "Supprimer mon compte". Attention, cette action est irréversible et supprimera toutes vos données de manière définitive.',
        },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.header}>
                <FontAwesome5 name="question-circle" size={50} color={colors.primary} />
                <Text style={[styles.title, { color: colors.primary }]}>Support & Aide</Text>
            </View>
            <Text style={[styles.text, { color: colors.text }]}>Retrouvez ici les réponses aux questions fréquentes et les moyens de contacter l’équipe Koosy.</Text>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>FAQ</Text>
                <FAQAccordion data={faqData} colors={colors} />
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Contact support</Text>
                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: colors.primary }]} onPress={() => Linking.openURL('mailto:contact@koosyapp.com?subject=Support KoosyApp')}>
                    <Text style={{ color: colors.surface, fontWeight: 'bold' }}>Envoyer un email</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                
                <Text style={[styles.text, { color: colors.text }]}>Pour plus d’informations, contactez-nous.</Text>
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
