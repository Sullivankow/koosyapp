// Ce fichier contient l'écran d'accueil (Dashboard) de l'application.
// Il affiche un résumé des compteurs (biens, réservations, tâches),
// une zone "Prochains événements" (arrivées/départs/nouvelles réservations)
// et des actions rapides pour créer un bien, une tâche, une réservation ou une prestation.
// Les commentaires ci-dessous expliquent le rôle des hooks, handlers et sections principales
// pour faciliter la maintenance et la relecture du code.
import QuickActionsGrid from '../../components/QuickActionsGrid';
import UpcomingEvents from '../../components/UpcomingEvents';
import React, { useState, useEffect } from 'react';
import { useSuccessMessage } from '../../hooks/useSuccessMessage';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { clearSession } from '../../utils/session';
import { useUserInfo } from '../../hooks/useUserInfo';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import SummaryCounters from '../../components/SummaryCounters';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import NotificationBell from '../../components/NotificationBell';
import { getReservationsCount } from '../../utils/api';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTacheCount } from '../../contexts/TacheCountContext';
import { useTache } from '../../contexts/TacheContext';
import AddBienModal from '../../components/modals/AddBienModal';
import AddTachesModal from '../../components/modals/AddTachesModal';
import AddReservationsModal from '../../components/modals/AddReservationsModal';
import AddPrestationModal from '../../components/modals/AddPrestationModal';
import { getBiens } from '../../utils/api';
import { useReservationForm } from '../../hooks/useReservationForm';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';
import { Bien, Entreprise } from '../../models/models';
import { useReservationRefresh } from '../../contexts/ReservationRefreshContext';
import { useChiffreAffaire } from '../../hooks/useChiffreAffaire';
import ChiffreAffaireCard from '../../components/ChiffreAffaireCard';
import { useAddDevisModal } from '../../hooks/useAddDevisModal';
import { apiFetchMyEntreprise } from '../../utils/api';


type HomeScreenProps = {
    onLogout?: () => void;
    navigation?: any;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, navigation }) => {
    const { tacheCount, refreshTacheCount } = useTacheCount();
    const { lastTacheAdded } = useTache();
    // Theme et couleurs fournis par le contexte `ThemeContext`
    const { colors, isDarkMode, toggleTheme } = useTheme();
    // Infos utilisateur via hook personnalisé
    const { userName, avatarUrl } = useUserInfo();
    const { biensCount, refreshBiensCount, lastBienAdded, signalBienAdded } = useBienCount();
    // Nombre total de réservations (affiché dans le résumé)
    const [reservationsCount, setReservationsCount] = useState(0);
    const [addBienModalVisible, setAddBienModalVisible] = useState(false);
    const [addTacheModalVisible, setAddTacheModalVisible] = useState(false);
    const [addReservationModalVisible, setAddReservationModalVisible] = useState(false);
    const [addPrestationModalVisible, setAddPrestationModalVisible] = useState(false);
    // Formulaire de réservation via hook personnalisé
    const { successMsg, showSuccess } = useSuccessMessage();
    const { form: reservationForm, setForm: setReservationForm, handleAddReservation, loading: reservationLoading, resetForm } = useReservationForm(
        () => {
            setAddReservationModalVisible(false);
            refreshBiensCount();
            signalBienAdded();
            getReservationsCount().then((data: { total: number }) => setReservationsCount(data.total ?? 0));
            signalReservationAdded();
            showSuccess('Réservation ajoutée avec succès !');
        }
    );
    // Liste de biens (pour alimenter la modale d'ajout de réservation)
    const [biens, setBiens] = useState<Bien[]>([]);
    // Liste des entreprises (pour alimenter la modale d'ajout de réservation)
    const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
    // Événements à venir via hook personnalisé
    const { events, loading: eventsLoading, error: eventsError, refresh: refreshEvents } = useUpcomingEvents();
    // Message de succès temporaire via hook personnalisé
    const { signalReservationAdded } = useReservationRefresh();
    // Ajout du hook pour le compteur de prestations terminées
    const { prestationsTerminees } = usePrestationsCount();
   const { caMois, caGlobal, caAnnee, caMoisN1 } = useChiffreAffaire();
    const [addDevisModalVisible, setAddDevisModalVisible] = useState(false);
    const { open: openAddDevisModal, modal: addDevisModal } = useAddDevisModal(entreprises);

    // Effet d'initialisation :
    // - rafraîchit les compteurs gérés par les contextes
    // - charge la liste de biens et compte des réservations
    useEffect(() => {
        refreshTacheCount();
        refreshBiensCount();

        // Récupère le nombre total de réservations (pour l'affichage synthétique)
        getReservationsCount()
            .then((data: { total: number }) => {
                setReservationsCount(data.total ?? 0);
            })
            .catch(() => setReservationsCount(0));

        // Charge les biens disponibles (utilisé par la modale d'ajout de réservation)
        getBiens().then(setBiens).catch(() => setBiens([]));
        // Charge les entreprises (utilisé par la modale d'ajout de réservation)
        apiFetchMyEntreprise()
            .then((entreprise) => setEntreprises(entreprise ? [entreprise] : []))
            .catch(() => setEntreprises([]));
        // Les événements sont désormais gérés par le hook useUpcomingEvents
    }, [lastTacheAdded, lastBienAdded]);

    // Les autres valeurs restent statiques pour l'instant

    // Handler de déconnexion : efface la session côté client et notifie le parent
    const handleLogout = async () => {
        await clearSession();
        if (onLogout) {
            onLogout();
        }
    };


    // Handler pour ouvrir la page ListeDevisScreen
    const handleGoToListeDevis = () => {
        if (navigation) navigation.navigate('ListeDevisScreen');
    };

    // Handler pour ouvrir la page ListeFactureScreen
    const handleGoToListeFacture = () => {
        if (navigation) navigation.navigate('ListeFactureScreen');
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
                        source={avatarUrl && avatarUrl.trim() !== '' ? { uri: avatarUrl } : require('../../assets/house.jpg')}
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
                <ChiffreAffaireCard caMois={caMois} caGlobal={caGlobal} caAnnee={caAnnee} caMoisN1={caMoisN1} />
                <SummaryCounters
                  biensCount={biensCount}
                  reservationsCount={reservationsCount}
                  tacheCount={tacheCount}
                  prestationsTerminees={prestationsTerminees}
                  colors={colors}
                  styles={styles}
                />

                {/* Prochain(s) événement(s) */}
                <UpcomingEvents
                  events={events}
                  loading={eventsLoading}
                  colors={colors}
                  styles={styles}
                />

                {/* Actions principales en grille 2x2 */}
                <QuickActionsGrid
                    colors={colors}
                    styles={styles}
                    onAddBien={() => setAddBienModalVisible(true)}
                    onAddTache={() => setAddTacheModalVisible(true)}
                    onAddReservation={() => setAddReservationModalVisible(true)}
                    onAddPrestation={() => setAddPrestationModalVisible(true)}
                    onAddDevis={handleGoToListeDevis}
                    onAddFacture={handleGoToListeFacture}
                />
            </ScrollView>
            {/* Modales gérées séparément (AddBien/AddTaches/AddReservations/AddPrestation) */}
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
        {/* Modal d'ajout de prestation */}
        <AddPrestationModal
            visible={addPrestationModalVisible}
            onClose={() => setAddPrestationModalVisible(false)}
            onSuccess={() => setAddPrestationModalVisible(false)}
        />
                {/* Modale d'ajout de devis via hook */}
                {addDevisModal}
        </>
    );
};

import { styles } from './Homescreen.styles';

export default HomeScreen;
