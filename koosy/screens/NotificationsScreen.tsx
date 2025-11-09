import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { savePushToken, updateUserSettings } from '../utils/api';

type PrefsKeys = keyof typeof initialPrefs;
const initialPrefs = {
    push: true,
    event: true,
};
interface NotificationType {
    key: PrefsKeys;
    label: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    desc: string;
}
const notificationTypes: NotificationType[] = [
    { key: 'push', label: 'Notifications push', icon: 'bell-ring', desc: 'Recevoir des alertes sur le téléphone.' },
    { key: 'event', label: 'Événements', icon: 'calendar-check', desc: 'Nouvelle réservation, arrivée, départ.' },
    // Tâches et Sécurité retirées temporairement
];

// éléments retirés temporairement pour simplifier l'écran

const NotificationsScreen: React.FC = () => {
    const { colors } = useTheme();
    const [prefs, setPrefs] = useState<typeof initialPrefs>(initialPrefs);

    useEffect(() => {
        // check current notification permission on mount and update the switch
        (async () => {
            try {
                const perm = await Notifications.getPermissionsAsync();
                const granted = (perm as any).granted || (perm as any).status === 'granted';
                setPrefs(prev => ({ ...prev, push: !!granted }));
            } catch (err) {
                    // ignore permission check errors en prod
                }
        })();
    }, []);

    const handleSwitch = async (key: PrefsKeys) => {
        // toggle locally first for immediate UI feedback
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        if (key === 'push') {
            try {
                if (newPrefs.push) {
                    const { status } = await Notifications.requestPermissionsAsync();
                    if (status !== 'granted') {
                        // user denied or blocked — offer to open settings
                        Alert.alert(
                            'Permission refusée',
                            "Les notifications push ont été refusées. Vous pouvez les activer depuis les paramètres de l'application.",
                            [
                                { text: 'Annuler', style: 'cancel' },
                                { text: 'Ouvrir paramètres', onPress: () => Linking.openSettings() },
                            ],
                        );
                        setPrefs({ ...newPrefs, push: false });
                        return;
                    }
                    // ensure projectId is available (required by expo-notifications for SDKs using EAS)
                    const projectId = (Constants.expoConfig as any)?.projectId || (Constants.expoConfig as any)?.extra?.eas?.projectId || (Constants.manifest as any)?.projectId;
                    if (!projectId) {
                        Alert.alert(
                            'Configuration manquante',
                            "Aucun 'projectId' Expo trouvé. Pour utiliser les push Expo, ajoutez le 'projectId' de votre projet expo.dev dans 'app.json' (champ 'expo.projectId') ou dans 'extra.eas.projectId'.\n\nTu peux créer/voir ton projectId sur https://expo.dev -> Project Settings.",
                        );
                        setPrefs({ ...newPrefs, push: false });
                        return;
                    }
                                const tokenObj = await Notifications.getExpoPushTokenAsync({ projectId });
                    const token = (tokenObj as any).data ?? (tokenObj as any).token ?? null;
                    await savePushToken(token);
                } else {
                    // user disabled push -> clear token on server
                    await savePushToken(null);
                }
            } catch (err: any) {
                console.error('Erreur push token:', err);
                Alert.alert('Erreur', "Impossible d'enregistrer le token de notifications.");
            }
                    } else if (key === 'event') {
                        // Mettre à jour la préférence côté serveur (merge-safe)
                        try {
                            await updateUserSettings({ eventsEnabled: !!newPrefs.event });
                        } catch (err: any) {
                            console.error('Erreur updateUserSettings:', err);
                            Alert.alert('Erreur', "Impossible de sauvegarder la préférence d'événements.");
                            // rollback visuel
                            setPrefs(prev => ({ ...prev, event: !prev.event }));
                        }
        }
    };
    // fréquence retirée — gestion désactivée pour l'instant

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
            {/* Fréquence des notifications retirée temporairement */}
          
            {/* Debug token and manual test button removed */}
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
    // subtitle style removed as it's unused
    // styles pour la fréquence et le bouton de sauvegarde retirés
});

export default NotificationsScreen;
