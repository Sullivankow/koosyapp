// Écran de paramètres de sécurité.
// Propose (pour l'instant) un simple switch de double authentification
// et une liste de bonnes pratiques pour sécuriser son compte.
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SecuriteScreen: React.FC = () => {
    const { colors } = useTheme();
    const [doubleAuth, setDoubleAuth] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Sécurité</Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="shield-lock" size={28} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.label, { color: colors.text }]}>Double authentification</Text>
                    <Switch
                        value={doubleAuth}
                        onValueChange={setDoubleAuth}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={doubleAuth ? colors.primary : colors.surface}
                        style={{ marginLeft: 'auto' }}
                    />
                </View>
                <Text style={[styles.desc, { color: colors.text }]}>Activez la double authentification pour renforcer la sécurité de votre compte.</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.primary }]}>Conseils de sécurité</Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.desc, { color: colors.text }]}>• Utilisez un mot de passe complexe et unique.</Text>
                <Text style={[styles.desc, { color: colors.text }]}>• Ne partagez jamais vos identifiants.</Text>
                <Text style={[styles.desc, { color: colors.text }]}>• Activez la double authentification.</Text>
                <Text style={[styles.desc, { color: colors.text }]}>• Vérifiez régulièrement vos connexions.</Text>
                <Text style={[styles.desc, { color: colors.text }]}>• Gardez votre application à jour.</Text>
            </View>
        </View>
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
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
        elevation: 2,
    },
    label: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    desc: {
        fontSize: 14,
        marginTop: 8,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

export default SecuriteScreen;

