import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearSession } from '../utils/session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import NotificationBell from '../components/NotificationBell';
import { getReservationsCount } from '../utils/api';
import { useBienCount } from '../contexts/BienCountContext';
import { useTacheCount } from '../contexts/TacheCountContext';
import { useTache } from '../contexts/TacheContext';
import AddBienModal from '../components/AddBienModal';
import AddTachesModal from '../components/AddTachesModal';
import AddReservationsModal from '../components/AddReservationsModal';
import { getBiens, createReservation, getReservations } from '../utils/api';
import { getMe, getEventsUpcoming } from '../utils/api';
import { Bien } from '../models/models';
import { useReservationRefresh } from '../contexts/ReservationRefreshContext';
import dayjs from 'dayjs';

type HomeScreenProps = {
    onLogout?: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
    const { tacheCount, refreshTacheCount } = useTacheCount();
    const { lastTacheAdded } = useTache();
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const navigation = useNavigation();
    const [userName, setUserName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const { biensCount, refreshBiensCount, lastBienAdded, signalBienAdded } = useBienCount();
    const [reservationsCount, setReservationsCount] = useState(0);
    const [addBienModalVisible, setAddBienModalVisible] = useState(false);
    const [addTacheModalVisible, setAddTacheModalVisible] = useState(false);
    const [addReservationModalVisible, setAddReservationModalVisible] = useState(false);
    const [reservationForm, setReservationForm] = useState<{
        bienId: string;
        locataireNom: string;
        locatairePrenom: string;
        locataireEmail: string;
        locataireTelephone: string;
        dateArrivee: string;
        dateDepart: string;
        heureArrivee: string;
        heureDepart: string;
        statut: 'confirmée' | 'en attente';
    }>({
        bienId: '',
        locataireNom: '',
        locatairePrenom: '',
        locataireEmail: '',
        locataireTelephone: '',
        dateArrivee: '',
        dateDepart: '',
        heureArrivee: '',
        heureDepart: '',
        statut: 'en attente',
    });
    const [biens, setBiens] = useState<Bien[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const { signalReservationAdded } = useReservationRefresh();

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
        getBiens().then(setBiens).catch(() => setBiens([]));
        // Récupérer les préférences utilisateur puis les événements si activé
        (async () => {
            try {
                const me = await getMe();
                const eventsEnabled = me?.settings?.eventsEnabled ?? true;
                if (eventsEnabled) {
                    setEventsLoading(true);
                    try {
                        const res = await getEventsUpcoming(7, 10, 1);
                        const items = Array.isArray(res) ? res : (res?.items ?? []);
                        setEvents(items);
                    } catch (err) {
                        // erreur lors du fetch, on renvoie une liste vide
                        setEvents([]);
                    } finally {
                        setEventsLoading(false);
                    }
                }
            } catch (err) {
                // erreur lors de la récupération de l'utilisateur ou des événements
            }
        })();
    }, [lastTacheAdded, lastBienAdded]);

    // Debug: log events state when it changes to verify UI receives the items
    // Retenu : suppression des logs de debug une fois la fonctionnalité validée
    useEffect(() => {
        // Intentionnellement vide — évite les logs de debug en production
    }, [events]);
    // Les autres valeurs restent statiques pour l'instant
    // const locatairesCount = 12; // supprimé, remplacé par le nombre de réservations
    const prochainEvenement = 'Check-in demain à 10h';

    const handleLogout = async () => {
        await clearSession();
        if (onLogout) {
            onLogout();
        }
    };

    // Ajout réservation depuis la modale
    const handleAddReservation = async () => {
        if (!reservationForm.bienId || !reservationForm.locataireNom || !reservationForm.locatairePrenom || !reservationForm.locataireEmail || !reservationForm.dateArrivee || !reservationForm.dateDepart) {
            alert('Merci de remplir tous les champs obligatoires.');
            return;
        }
        try {
            // Conversion ISO -> JJ/MM/AAAA pour le backend (comme CalendrierScreen)
            const formatToFR = (iso: string) => {
                if (/^(\d{4})-(\d{2})-(\d{2})$/.test(iso)) {
                    return dayjs(iso).format('DD/MM/YYYY');
                }
                return iso;
            };
            await createReservation({
                bienId: Number(reservationForm.bienId),
                locataireNom: reservationForm.locataireNom,
                locatairePrenom: reservationForm.locatairePrenom,
                locataireEmail: reservationForm.locataireEmail,
                locataireTelephone: reservationForm.locataireTelephone,
                dateDebut: formatToFR(reservationForm.dateArrivee),
                dateFin: formatToFR(reservationForm.dateDepart),
                statut: reservationForm.statut as 'confirmée' | 'en attente',
            });
            setAddReservationModalVisible(false);
            setReservationForm({ bienId: '', locataireNom: '', locatairePrenom: '', locataireEmail: '', locataireTelephone: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' });
            // Rafraîchir le compteur et la liste via le contexte
            refreshBiensCount();
            signalBienAdded();
            getReservationsCount().then((data: { total: number }) => setReservationsCount(data.total ?? 0));
            // Signal global pour rafraîchir la page des réservations
            signalReservationAdded();
            // Affiche le message de succès
            setSuccessMsg('Réservation ajoutée avec succès !');
            setTimeout(() => setSuccessMsg(''), 2000);
        } catch (e) {
            // erreur lors de l'ajout de la réservation (gérée par l'alerte utilisateur)
            alert("Erreur lors de l'ajout de la réservation");
        }
    };

    return (
        <>
            {successMsg ? (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: colors.success || '#43A047', padding: 14, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{successMsg}</Text>
                </View>
            ) : null}
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
                    <NotificationBell style={[styles.iconBtn, { backgroundColor: colors.accent }]} size={30} color={colors.surface} />
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]} onPress={toggleTheme}>
                        <MaterialCommunityIcons name={isDarkMode ? 'weather-sunny' : 'weather-night'} size={22} color={colors.surface} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.error }]} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={22} color={colors.surface} />
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

                {/* Prochain(s) événement(s) - structure réorganisée pour éviter overflow */}
                <View style={[styles.eventBox, { backgroundColor: colors.accent, alignItems: 'flex-start' }]}>
                    <View style={{ marginRight: 8, paddingTop: 2 }}>
                        <MaterialCommunityIcons name="calendar" size={20} color={colors.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.eventText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">Prochains événements :</Text>
                        <View style={{ marginTop: 6 }}>
                            {eventsLoading ? (
                                <Text style={{ color: colors.text }}>Chargement...</Text>
                            ) : events && events.length > 0 ? (
                                // Affiche jusqu'à 3 prochains événements dans une liste concise
                                <View>
                    <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled={true}>
                        {events.map((ev: any, idx: number) => {
                                        const humanType = (() => {
                                            const t = (ev.type || '').toLowerCase();
                                            if (t.includes('new') || t.includes('nouveau') || t.includes('reservation')) return 'Nouvelle réservation';
                                            if (t.includes('arrival') || t.includes('arrive') || t.includes('arrivée')) return 'Arrivée';
                                            if (t.includes('departure') || t.includes('depart') || t.includes('départ')) return 'Départ';
                                            return ev.type || 'Événement';
                                        })();

                                        const dateStr = (() => {
                                            if (ev.dateDebut) return dayjs(ev.dateDebut).format('DD/MM/YYYY');
                                            if (ev.dateFin) return dayjs(ev.dateFin).format('DD/MM/YYYY');
                                            if (ev.createdAt) return dayjs(ev.createdAt).format('DD/MM/YYYY');
                                            if (ev.date) return dayjs(ev.date).format('DD/MM/YYYY');
                                            return '';
                                        })();

                                        const locataireName = ev.locataire ? `${ev.locataire.prenom ?? ''} ${ev.locataire.nom ?? ''}`.trim() : (ev.locataireNom ? `${ev.locatairePrenom ?? ''} ${ev.locataireNom ?? ''}`.trim() : 'Locataire inconnu');

                                        return (
                                            <View key={`ev-${idx}`} style={styles.eventRow}>
                                                <Text style={[styles.eventRowTitle, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">{humanType} · {ev.bien?.nom ?? ev.bienNom ?? 'Bien inconnu'}</Text>
                                                <Text style={[styles.eventRowSubtitle, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{locataireName}{dateStr ? ` — ${dateStr}` : ''}</Text>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                                    </View>
                                ) : (
                                <Text style={{ color: colors.text }}>Aucun événement prévu</Text>
                            )}
                        </View>
                    </View>
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
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={() => setAddReservationModalVisible(true)}>
                            <View style={styles.centerContent}>
                                <MaterialCommunityIcons name="calendar-plus" size={24} color={colors.surface} style={styles.icon} />
                                <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une résa</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success || '#4CAF50' }]}>
                            <View style={styles.centerContent}>
                                <FontAwesome5 name="user-plus" size={22} color={colors.surface} style={styles.icon} />
                                <Text style={[styles.actionText, { color: colors.surface }]}>Ajouter une prestation</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {/* Modales gérées séparément (AddBien/AddTaches/AddReservations) — modale de notifications statique supprimée */}
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
        {/* Modale d'ajout de réservation */}
        <AddReservationsModal
            visible={addReservationModalVisible}
            onClose={() => setAddReservationModalVisible(false)}
            onSave={handleAddReservation}
            form={reservationForm}
            setForm={setReservationForm}
            biens={biens}
            colors={colors}
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
    eventRow: {
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: '#00000010',
        marginRight: 6,
    },
    eventRowTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    eventRowSubtitle: {
        fontSize: 12,
        marginTop: 2,
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
    /* styles pour la modale de notifications supprimés - modales restantes utilisent leurs propres styles */
});

export default HomeScreen;
