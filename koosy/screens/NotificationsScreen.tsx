import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PrefsKeys = 'push' | 'email' | 'event' | 'tache' | 'message' | 'securite';
interface NotificationType {
    key: PrefsKeys;
    label: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    desc: string;
}
const notificationTypes: NotificationType[] = [
    { key: 'push', label: 'Notifications push', icon: 'bell-ring', desc: 'Recevoir des alertes sur le téléphone.' },
    { key: 'email', label: 'Notifications email', icon: 'email', desc: 'Recevoir des notifications par email.' },
    { key: 'event', label: 'Événements', icon: 'calendar-check', desc: 'Nouvelle réservation, arrivée, départ.' },
    { key: 'tache', label: 'Tâches', icon: 'clipboard-list', desc: 'Tâche à faire ou en retard.' },
    { key: 'message', label: 'Messages', icon: 'message-text', desc: 'Nouveau message ou commentaire.' },
    { key: 'securite', label: 'Sécurité', icon: 'shield-lock', desc: 'Modification du profil ou sécurité.' },
];

const frequencies = [
    { key: 'immediat', label: 'Immédiat' },
    { key: 'quotidien', label: 'Quotidien' },
    { key: 'hebdo', label: 'Hebdomadaire' },
];

const NotificationsScreen: React.FC = () => {
    const { colors } = useTheme();
    const [prefs, setPrefs] = useState<{
        push: boolean;
        email: boolean;
        event: boolean;
        tache: boolean;
        message: boolean;
        securite: boolean;
        freq: string;
    }>({
        push: true,
        email: false,
        event: true,
        tache: true,
        message: true,
        securite: false,
        freq: 'immediat',
    });
    const handleSwitch = (key: PrefsKeys) => setPrefs({ ...prefs, [key]: !prefs[key] });
    const handleFreq = (key: string) => setPrefs({ ...prefs, freq: key });

    const handleSave = () => {
        // Appel API ou stockage local
        alert('Préférences enregistrées !');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.title, { color: colors.primary }]}>Notifications</Text>
            {notificationTypes.map(nt => (
                <View key={nt.key} style={[styles.row, { backgroundColor: colors.surface }]}>
                    <MaterialCommunityIcons name={nt.icon} size={24} color={colors.primary} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.text }]}>{nt.label}</Text>
                        <Text style={[styles.desc, { color: colors.text }]}>{nt.desc}</Text>
                    </View>
                    <Switch
                        value={prefs[nt.key]}
                        onValueChange={() => handleSwitch(nt.key)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={prefs[nt.key] ? colors.primary : colors.surface}
                    />
                </View>
            ))}
            <Text style={[styles.subtitle, { color: colors.primary }]}>Fréquence des notifications</Text>
            <View style={styles.freqRow}>
                {frequencies.map(f => (
                    <TouchableOpacity key={f.key} style={[styles.freqBtn, { backgroundColor: prefs.freq === f.key ? colors.primary : colors.surface }]} onPress={() => handleFreq(f.key)}>
                        <Text style={{ color: prefs.freq === f.key ? colors.surface : colors.text, fontWeight: 'bold' }}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <MaterialCommunityIcons name="content-save" size={20} color={colors.surface} />
                <Text style={[styles.saveText, { color: colors.surface }]}>Enregistrer</Text>
            </TouchableOpacity>
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    label: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    desc: {
        fontSize: 13,
        color: '#888',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
    },
    freqRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 18,
    },
    freqBtn: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
        marginHorizontal: 4,
        elevation: 2,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
        elevation: 2,
    },
    saveText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NotificationsScreen;
