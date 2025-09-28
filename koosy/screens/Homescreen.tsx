import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearSession } from '../utils/session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { getReservationsCount } from '../utils/api';
import { useBienCount } from '../contexts/BienCountContext';
import { useTacheCount } from '../contexts/TacheCountContext';
import { useTache } from '../contexts/TacheContext';
import AddBienModal from '../components/AddBienModal';
import AddTachesModal from '../components/AddTachesModal';

type HomeScreenProps = {
    onLogout?: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
    const { tacheCount, refreshTacheCount } = useTacheCount();
    const { lastTacheAdded } = useTache();
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const navigation = useNavigation();
    const [notifVisible, setNotifVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const { biensCount, refreshBiensCount, lastBienAdded } = useBienCount();
    const [reservationsCount, setReservationsCount] = useState(0);
    const [addBienModalVisible, setAddBienModalVisible] = useState(false);
    const [addTacheModalVisible, setAddTacheModalVisible] = useState(false);

    useEffect(() => {
        refreshTacheCount();
        refreshBiensCount();
        AsyncStorage.getItem('koosy_user').then(data => {
            if (data) {
                try {
                    const { prenom } = JSON.parse(data);
                    setUserName(prenom);
                    setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(prenom)}&background=random`);
                } catch {}
            }
        });
        // Le compteur de biens est géré par le contexte
       getReservationsCount()
  .then((data: { total: number }) => {
    setReservationsCount(data.total ?? 0);
  })
  .catch(() => setReservationsCount(0));
    }, [lastTacheAdded, lastBienAdded]);
    // Les autres valeurs restent statiques pour l'instant
    // const locatairesCount = 12; // supprimé, remplacé par le nombre de réservations
    const prochainEvenement = 'Check-in demain à 10h';

    const handleLogout = async () => {
        await clearSession();
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <>
            <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
                {/* Avatar et message personnalisé */}
                <View style={styles.avatarRow}>
                    <Image
                        source={avatarUrl && avatarUrl.trim() !== '' ? { uri: avatarUrl } : require('../assets/house.jpg')}
                        style={styles.avatar}
                    />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.welcome, { color: colors.primary }]}>Bonjour, {userName} 👋</Text>
                        <Text style={[styles.subtitle, { color: colors.text }]}>Votre tableau de bord conciergerie</Text>
                    </View>
                </View>

                {/* Actions rapides en haut */}
                <View style={styles.topActions}>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.accent }]} onPress={() => setNotifVisible(true)}>
                        <MaterialCommunityIcons name="bell-outline" size={28} color={colors.surface} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={toggleTheme}>
                        <MaterialCommunityIcons name={isDarkMode ? 'weather-sunny' : 'weather-night'} size={28} color={colors.surface} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.error }]} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={28} color={colors.surface} />
                    </TouchableOpacity>
                </View>

                {/* Résumé interactif */}
                <View style={styles.summaryContainer}>
                    <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                        <FontAwesome5 name="building" size={22} color={colors.primary} style={{ marginBottom: 5 }} />
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Biens</Text>
                        <Text style={[styles.summaryValue, { color: colors.primary }]}>{biensCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                        <FontAwesome5 name="calendar-check" size={22} color={colors.primary} style={{ marginBottom: 5 }} />
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Réserv.</Text>
                        <Text style={[styles.summaryValue, { color: colors.primary }]}>{reservationsCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                        <MaterialCommunityIcons name="alert-circle" size={22} color={colors.error} style={{ marginBottom: 5 }} />
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tâches à faire</Text>
                        <Text style={[styles.summaryValue, { color: colors.error }]}>{tacheCount}</Text>
                    </TouchableOpacity>
                </View>

                {/* Prochain événement */}
                <View style={[styles.eventBox, { backgroundColor: colors.accent }]}>
                    <MaterialCommunityIcons name="calendar" size={20} color={colors.text} style={{ marginRight: 8 }} />
                    <Text style={[styles.eventText, { color: colors.text }]}>Prochain événement : {prochainEvenement}</Text>
                </View>

                {/* Actions principales en grille 2x2 */}
                <View style={styles.quickActionsGrid}>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => setAddBienModalVisible(true)}>
                            <View style={styles.centerContent}>
                                <MaterialCommunityIcons name="plus-circle" size={24} color={colors.surface} style={styles.icon} />
                                <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter un bien</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]} onPress={() => setAddTacheModalVisible(true)}>
                            <View style={styles.centerContent}>
                                <MaterialCommunityIcons name="playlist-plus" size={24} color={colors.surface} style={styles.icon} />
                                <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une tâche</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.quickActionsRow}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]}>
                            <View style={styles.centerContent}>
                                <MaterialCommunityIcons name="calendar-plus" size={24} color={colors.surface} style={styles.icon} />
                                <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une résa</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success || '#4CAF50' }]}>
                            <View style={styles.centerContent}>
                                <FontAwesome5 name="user-plus" size={22} color={colors.surface} style={styles.icon} />
                                <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter un locataire</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {/* Modal notifications façon Facebook */}
            <Modal
                visible={notifVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setNotifVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.notificationsTitle, { color: colors.primary }]}>Notifications</Text>
                        <View style={styles.notificationRow}>
                            <MaterialCommunityIcons name="cash" size={18} color={colors.success || 'green'} style={{ marginRight: 4 }} />
                            <Text style={[styles.notificationItem, { color: colors.text }]}>Paiement reçu pour le bien #2</Text>
                        </View>
                        <View style={styles.notificationRow}>
                            <MaterialCommunityIcons name="wrench" size={18} color={colors.accent} style={{ marginRight: 4 }} />
                            <Text style={[styles.notificationItem, { color: colors.text }]}>Intervention prévue demain</Text>
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setNotifVisible(false)}>
                            <Text style={{ color: colors.error, fontWeight: 'bold' }}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        {/* Modal d'ajout de bien */}
        <AddBienModal
            visible={addBienModalVisible}
            onClose={() => setAddBienModalVisible(false)}
            onSuccess={() => setAddBienModalVisible(false)}
        />
        {/* Modal d'ajout de tâche */}
        <AddTachesModal
            visible={addTacheModalVisible}
            onClose={() => setAddTacheModalVisible(false)}
            onSuccess={() => setAddTacheModalVisible(false)}
        />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 18,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#eee',
    },
    welcome: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
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
        minWidth: 90,
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
        flexDirection: 'row',
        gap: 8,
    },
    eventText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quickActionsGrid: {
        width: '100%',
        marginBottom: 20,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    actionBtn: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 10,
        paddingVertical: 18,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    centerContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    notificationsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationItem: {
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        borderRadius: 16,
        padding: 24,
        elevation: 5,
        alignItems: 'center',
    },
    closeBtn: {
        marginTop: 18,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
});

export default HomeScreen;
