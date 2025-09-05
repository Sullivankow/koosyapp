import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HomeScreenProps = {
    onLogout: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
    const { colors, isDarkMode, toggleTheme } = useTheme();

    // Exemples de données fictives
    const biensCount = 5;
    const locatairesCount = 12;
    const tachesUrgentes = 2;
    const prochainEvenement = 'Check-in demain à 10h';

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
            <View style={styles.topActions}>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={toggleTheme}>
                    <MaterialCommunityIcons
                        name={isDarkMode ? 'weather-sunny' : 'weather-night'}
                        size={28}
                        color={colors.surface}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.error }]} onPress={onLogout}>
                    <MaterialCommunityIcons
                        name="logout"
                        size={28}
                        color={colors.surface}
                    />
                </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: colors.primary }]}>Bienvenue sur Koosy !</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>Votre tableau de bord conciergerie</Text>

            <View style={styles.summaryContainer}>
                <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Biens</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{biensCount}</Text>
                </View>
                <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Locataires</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{locatairesCount}</Text>
                </View>
                <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tâches urgentes</Text>
                    <Text style={[styles.summaryValue, { color: colors.error }]}>{tachesUrgentes}</Text>
                </View>
            </View>

            <View style={[styles.eventBox, { backgroundColor: colors.accent }]}>
                <Text style={[styles.eventText, { color: colors.text }]}>Prochain événement : {prochainEvenement}</Text>
            </View>

            <View style={styles.quickActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter un bien</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une tâche</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.notifications}>
                <Text style={[styles.notificationsTitle, { color: colors.textSecondary }]}>Notifications</Text>
                <Text style={[styles.notificationItem, { color: colors.text }]}>- Paiement reçu pour le bien #2</Text>
                <Text style={[styles.notificationItem, { color: colors.text }]}>- Intervention prévue demain</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        gap: 10,
    },
    iconBtn: {
        borderRadius: 20,
        padding: 10,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    summaryBox: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    eventBox: {
        width: '100%',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
    },
    eventText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    actionBtn: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notifications: {
        width: '100%',
        marginTop: 10,
    },
    notificationsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    notificationItem: {
        fontSize: 14,
        marginBottom: 2,
    },
});

export default HomeScreen;