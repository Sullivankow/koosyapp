import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import QuickActionsGridCard from '../../components/cards/QuickActionsGridCard';
import ConseilsDéfilants from '../../components/ConseilsDéfilants';
import UpcomingEvents from '../../components/UpcomingEvents';
import SummaryGridCard from '../../components/cards/SummaryGridCard';
import ChiffreAffaireCard from '../../components/cards/ChiffreAffaireCard';
import NotificationBell from '../../ui/NotificationBell';
import AddBienModal from '../../components/modals/AddBienModal';
import AddReservationsModal from '../../components/modals/AddReservationsModal';
import AddPrestationModal from '../../components/modals/AddPrestationModal';

import { useSuccessMessage } from '../../hooks/useSuccessMessage';
import { useUserInfo } from '../../hooks/useUserInfo';
import { useTheme } from '../../contexts/ThemeContext';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTacheCount } from '../../contexts/TacheCountContext';
import { useTache } from '../../contexts/TacheContext';
import { useReservationForm } from '../../hooks/useReservationForm';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';
import { useReservationRefresh } from '../../contexts/ReservationRefreshContext';
import { useChiffreAffaire } from '../../hooks/useChiffreAffaire';
import { useAddDevisModal } from '../../hooks/useAddDevisModal';

import { logoutCurrentSession, apiFetchMyEntreprise, getMe } from '../../utils/api';
import { getReservationsCount } from '../../utils/reservationApi';
import { getBiens } from '../../utils/bienApi';
import { Bien, Entreprise } from '../../models/models';
import { styles } from './styles/Homescreen.styles';

type HomeScreenProps = {
    onLogout?: () => void;
    navigation?: any;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, navigation }) => {
    const { tacheCount, refreshTacheCount } = useTacheCount();
    const { lastTacheAdded } = useTache();
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const { userName } = useUserInfo();
    const { biensCount, refreshBiensCount, lastBienAdded, signalBienAdded } = useBienCount();
    const { prestationsTerminees } = usePrestationsCount();
    const { signalReservationAdded, lastReservationAdded } = useReservationRefresh();
    const { successMsg, showSuccess } = useSuccessMessage();
    const { events, loading: eventsLoading, refresh: refreshUpcomingEvents } = useUpcomingEvents();
    const {
        caMois,
        caGlobal,
        caAnnee,
        caMoisN1,
        caJour,
        caJourN1,
        caAnneeN1,
        caMoisN2,
        margeMois,
        margeGlobal,
        margeAnnee,
        margeMoisN1,
        margeJour,
        margeJourN1,
        margeAnneeN1,
        margeMoisN2,
    } = useChiffreAffaire();

    const [reservationsCount, setReservationsCount] = useState(0);
    const [addBienModalVisible, setAddBienModalVisible] = useState(false);
    const [addReservationModalVisible, setAddReservationModalVisible] = useState(false);
    const [addPrestationModalVisible, setAddPrestationModalVisible] = useState(false);
    const [isBetaUser, setIsBetaUser] = useState(false);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const [biens, setBiens] = useState<Bien[]>([]);
    const [entreprises, setEntreprises] = useState<Entreprise[]>([]);

    const { modal: addDevisModal } = useAddDevisModal(entreprises);
    const { form: reservationForm, setForm: setReservationForm, handleAddReservation } = useReservationForm(
        () => {
            setAddReservationModalVisible(false);
            refreshBiensCount();
            signalBienAdded();
            getReservationsCount().then((data: { total: number }) => setReservationsCount(data.total ?? 0));
            signalReservationAdded();
            showSuccess('Reservation ajoutee avec succes !');
        }
    );

    useEffect(() => {
        refreshTacheCount();
        refreshBiensCount();

        getReservationsCount()
            .then((data: { total: number }) => setReservationsCount(data.total ?? 0))
            .catch(() => setReservationsCount(0));

        getBiens().then(setBiens).catch(() => setBiens([]));
        apiFetchMyEntreprise()
            .then((entreprise) => setEntreprises(entreprise ? [entreprise] : []))
            .catch(() => setEntreprises([]));
    }, [lastTacheAdded, lastBienAdded]);

    useEffect(() => {
        const loadUserAccess = async () => {
            try {
                const me = await getMe();
                const betaAccessUntil = (me as any)?.betaAccessUntil;
                const betaTs = betaAccessUntil ? new Date(betaAccessUntil).getTime() : Number.NaN;
                setIsBetaUser(Number.isFinite(betaTs) && betaTs >= Date.now());
                setIsPremiumUser((me as any)?.abonnement === 'premium');
            } catch {
                setIsBetaUser(false);
                setIsPremiumUser(false);
            }
        };

        loadUserAccess();
    }, []);

    useEffect(() => {
        void refreshUpcomingEvents();
    }, [lastReservationAdded, refreshUpcomingEvents]);

    const handleLogout = async () => {
        await logoutCurrentSession();
        onLogout?.();
    };

    const userInitials = userName
        ? userName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('')
        : 'U';

    // Use the theme's color palette rather than hardcoded light-mode fallbacks
    const brandColor = colors.primary || '#145C53';
    const dashboardBackground = colors.background || '#EEF4F2';
    const dashboardSurface = colors.surface || '#FFFFFF';
    const avatarBackgroundColor = colors.secondary || brandColor;
    const arrivalsToday = events?.filter((event: any) => String(event?.type || '').toLowerCase() === 'arrival').length ?? 0;
    const departuresToday = events?.filter((event: any) => String(event?.type || '').toLowerCase() === 'departure').length ?? 0;
    const primaryBien = biens[0];
    const primaryReservation = primaryBien?.reservations?.[0];
    const primaryPropertyTitle = primaryBien?.nom || 'Aucun bien actif';
    const primaryPropertyAddress = primaryBien?.adresse || 'Ajoutez un bien pour piloter votre activite';
    const primaryPropertyStatus = primaryBien?.statut || 'disponible';
    const nextReservationLabel = primaryReservation
        ? `${primaryReservation.dateDebut || primaryReservation.dateArrivee || 'Date a confirmer'}${primaryReservation.heureArrivee ? ` - ${primaryReservation.heureArrivee}` : ''}`
        : 'Aucune arrivee planifiee';

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={brandColor} />
            {successMsg ? (
                <View style={[styles.successToast, { backgroundColor: colors.success || '#43A047' }]}>
                    <Text style={styles.successToastText}>{successMsg}</Text>
                </View>
            ) : null}

            <ScrollView
                style={{ flex: 1, backgroundColor: dashboardBackground }}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.hero, { backgroundColor: brandColor }]}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.avatarRow}>
                            <View style={[styles.avatar, { backgroundColor: avatarBackgroundColor }]}>
                                <Text style={styles.avatarInitials}>{userInitials}</Text>
                            </View>
                            <View style={styles.heroCopy}>
                                <Text style={styles.eyebrow}>Bonjour {userName || ''}</Text>
                                <Text style={styles.welcome}>Tableau de bord</Text>
                            </View>
                        </View>

                        <View style={styles.topActions}>
                            <NotificationBell style={styles.iconBtn} size={24} color="#FFFFFF" />
                            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
                                <MaterialCommunityIcons name={isDarkMode ? 'weather-sunny' : 'weather-night'} size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                                <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.accessRow}>
                        <View style={styles.subtitleBadge}>
                            <Text style={styles.subtitle}>Conciergerie connectee</Text>
                        </View>
                        {isBetaUser || isPremiumUser ? (
                            <View style={styles.planBadge}>
                                <Text style={[styles.planText, { color: brandColor }]}>{isBetaUser ? 'BETA' : 'PREMIUM'}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={[styles.todayCard, { backgroundColor: dashboardSurface, shadowColor: colors.shadow }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Aujourd'hui</Text>
                        <Text style={[styles.sectionLink, { color: brandColor }]}>Pilotage</Text>
                    </View>
                    <View style={styles.todayGrid}>
                        <View style={styles.todayMetric}>
                            <Text style={[styles.todayValue, { color: brandColor }]}>{arrivalsToday}</Text>
                            <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Arrivees</Text>
                        </View>
                        <View style={styles.todayMetric}>
                            <Text style={[styles.todayValue, { color: brandColor }]}>{departuresToday}</Text>
                            <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Departs</Text>
                        </View>
                        <View style={styles.todayMetric}>
                            <Text style={[styles.todayValue, { color: brandColor }]}>{biensCount}</Text>
                            <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Biens actifs</Text>
                        </View>
                        <View style={styles.todayMetric}>
                            <Text style={[styles.todayValue, { color: brandColor }]}>{tacheCount}</Text>
                            <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Taches</Text>
                        </View>
                    </View>
                </View>

                <UpcomingEvents events={events} loading={eventsLoading} colors={colors} styles={styles} />

                <View style={[styles.propertyCard, { backgroundColor: dashboardSurface, shadowColor: colors.shadow }]}>
                    <View style={styles.propertyVisual}>
                        <View style={styles.propertyHouseShape} />
                        <View style={[styles.statusPill, { backgroundColor: `${brandColor}12`, borderColor: `${brandColor}22` }]}> 
                            <Text style={[styles.statusPillText, { color: brandColor }]}>{String(primaryPropertyStatus)}</Text>
                        </View>
                    </View>
                    <View style={styles.propertyBody}>
                        <View style={styles.propertyTitleRow}>
                            <View style={styles.propertyTitleCopy}>
                                <Text style={[styles.propertyTitle, { color: colors.text }]} numberOfLines={1}>{primaryPropertyTitle}</Text>
                                <Text style={[styles.propertyAddress, { color: colors.textSecondary }]} numberOfLines={1}>{primaryPropertyAddress}</Text>
                            </View>
                            <Text style={[styles.propertyRevenue, { color: brandColor }]}>{reservationsCount} resas</Text>
                        </View>
                        <View style={styles.nextVisitBox}>
                            <Text style={[styles.nextVisitLabel, { color: colors.textSecondary }]}>Prochaine arrivee</Text>
                            <Text style={[styles.nextVisitValue, { color: colors.text }]} numberOfLines={1}>{nextReservationLabel}</Text>
                        </View>
                    </View>
                </View>

                <ChiffreAffaireCard
                    caMois={caMois}
                    caGlobal={caGlobal}
                    caAnnee={caAnnee}
                    caMoisN1={caMoisN1}
                    caJour={caJour}
                    caJourN1={caJourN1}
                    caAnneeN1={caAnneeN1}
                    caMoisN2={caMoisN2}
                    margeMois={margeMois}
                    margeGlobal={margeGlobal}
                    margeAnnee={margeAnnee}
                    margeMoisN1={margeMoisN1}
                    margeJour={margeJour}
                    margeJourN1={margeJourN1}
                    margeAnneeN1={margeAnneeN1}
                    margeMoisN2={margeMoisN2}
                />
                <SummaryGridCard
                    biensCount={biensCount}
                    reservationsCount={reservationsCount}
                    tacheCount={tacheCount}
                    prestationsTerminees={prestationsTerminees}
                />

                <ConseilsDéfilants />

                <QuickActionsGridCard
                    onAddBien={() => setAddBienModalVisible(true)}
                    onAddTache={() => navigation && navigation.navigate('TachesScreen')}
                    onAddReservation={() => setAddReservationModalVisible(true)}
                    onAddPrestation={() => setAddPrestationModalVisible(true)}
                    onGoToDevis={() => navigation && navigation.navigate('ListeDevisScreen')}
                    onGoToFacture={() => navigation && navigation.navigate('ListeFactureScreen')}
                    onGoToPlanning={() => navigation && navigation.navigate('PlanningScreen')}
                    onGoToCharges={() => navigation && navigation.navigate('ChargesScreen')}
                />
            </ScrollView>

            <AddBienModal
                visible={addBienModalVisible}
                onClose={() => setAddBienModalVisible(false)}
                onSuccess={() => setAddBienModalVisible(false)}
            />
            <AddReservationsModal
                visible={addReservationModalVisible}
                onClose={() => setAddReservationModalVisible(false)}
                onSave={handleAddReservation}
                form={reservationForm}
                setForm={setReservationForm}
                biens={biens}
                colors={colors}
            />
            <AddPrestationModal
                visible={addPrestationModalVisible}
                onClose={() => setAddPrestationModalVisible(false)}
                onSuccess={() => setAddPrestationModalVisible(false)}
            />
            {addDevisModal}
        </>
    );
};

export default HomeScreen;
