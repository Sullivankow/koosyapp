// Ce fichier contient l'écran d'accueil (Dashboard) de l'application.
// Il affiche un résumé des compteurs (biens, réservations, tâches),
// une zone "Prochains événements" (arrivées/départs/nouvelles réservations)
// et des actions rapides pour créer un bien, une tâche, une réservation ou une prestation.
// Les commentaires ci-dessous expliquent le rôle des hooks, handlers et sections principales
// pour faciliter la maintenance et la relecture du code.
import QuickActionsGridCard from '../../components/cards/QuickActionsGridCard';
import UpcomingEvents from '../../components/UpcomingEvents';
import React, { useState, useEffect } from 'react';
import { useSuccessMessage } from '../../hooks/useSuccessMessage';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { clearSession } from '../../utils/session';
import { useUserInfo } from '../../hooks/useUserInfo';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SummaryGridCard from '../../components/cards/SummaryGridCard';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import NotificationBell from '../../ui/NotificationBell';
import { getReservationsCount } from '../../utils/api';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTacheCount } from '../../contexts/TacheCountContext';
import { useTache } from '../../contexts/TacheContext';
import AddBienModal from '../../components/modals/AddBienModal';
import AddReservationsModal from '../../components/modals/AddReservationsModal';
import AddPrestationModal from '../../components/modals/AddPrestationModal';
import { getBiens } from '../../utils/api';
import { useReservationForm } from '../../hooks/useReservationForm';
import { useUpcomingEvents } from '../../hooks/useUpcomingEvents';
import { Bien, Entreprise } from '../../models/models';
import { useReservationRefresh } from '../../contexts/ReservationRefreshContext';
import { useChiffreAffaire } from '../../hooks/useChiffreAffaire';
import ChiffreAffaireCard from '../../components/cards/ChiffreAffaireCard';
import { useAddDevisModal } from '../../hooks/useAddDevisModal';
import { apiFetchMyEntreprise } from '../../utils/api';


type HomeScreenProps = {
    onLogout?: () => void;
    navigation?: any;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, navigation }) => {
    // Compteur global de tâches et fonction de rafraîchissement associée.
    const { tacheCount, refreshTacheCount } = useTacheCount();
    const { lastTacheAdded } = useTache();
    // Theme et couleurs fournis par le contexte `ThemeContext`
    const { colors, isDarkMode, toggleTheme } = useTheme();
    // Infos utilisateur via hook personnalisé
    const { userName } = useUserInfo();
    // Compteur global de biens et signaux de rafraîchissement lorsque des biens sont ajoutés.
    const { biensCount, refreshBiensCount, lastBienAdded, signalBienAdded } = useBienCount();
    // Nombre total de réservations (affiché dans le résumé)
    const [reservationsCount, setReservationsCount] = useState(0);
    const [addBienModalVisible, setAddBienModalVisible] = useState(false);
    const [addReservationModalVisible, setAddReservationModalVisible] = useState(false);
    const [addPrestationModalVisible, setAddPrestationModalVisible] = useState(false);
    // Formulaire de réservation via hook personnalisé
    const { successMsg, showSuccess } = useSuccessMessage();
    // Hook formulaire de réservation rapide utilisé dans le dashboard (modale de réservation).
    const { form: reservationForm, setForm: setReservationForm, handleAddReservation } = useReservationForm(
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
    // Récupère les prochains événements (réservations, échéances) affichés dans la section agenda.
    const { events, loading: eventsLoading } = useUpcomingEvents();
    // Message de succès temporaire via hook personnalisé
    const { signalReservationAdded } = useReservationRefresh();
    // Ajout du hook pour le compteur de prestations terminées
    const { prestationsTerminees } = usePrestationsCount();
    const { caMois, caGlobal, caAnnee, caMoisN1 } = useChiffreAffaire();
     const { modal: addDevisModal } = useAddDevisModal(entreprises);

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
    // Déconnecte l'utilisateur : nettoyage de la session puis éventuelle notification au parent.
    const handleLogout = async () => {
        await clearSession();
        if (onLogout) {
            onLogout();
        }
    };


    // Handler pour ouvrir la page ListeDevisScreen
    // Raccourci vers l'écran de gestion des devis.
    const handleGoToListeDevis = () => {
        if (navigation) navigation.navigate('ListeDevisScreen');
    };

    // Handler pour ouvrir la page ListeFactureScreen
    // Raccourci vers l'écran de gestion des factures.
    const handleGoToListeFacture = () => {
        if (navigation) navigation.navigate('ListeFactureScreen');
    };

    // Handler pour ouvrir la page PlanningScreen
    // Raccourci vers le planning des prestations.
    const handleGoToPlanning = () => {
        if (navigation) navigation.navigate('PlanningScreen');
    };

    // Handler pour ouvrir la page Répertoire Propriétaire
    // Raccourci vers le répertoire des propriétaires.
    const handleGoToRepertoireProprietaire = () => {
        if (navigation) navigation.navigate('RepertoireProprietaireScreen');
    };

    const userInitials = userName
        ? userName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('')
        : 'U';

    const avatarBackgroundColor = isDarkMode ? colors.secondary : colors.primary;

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
                    <View style={[styles.avatar, { backgroundColor: avatarBackgroundColor }]}>
                        <Text style={styles.avatarInitials}>{userInitials}</Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.welcome, { color: colors.primary }]}>Bonjour, {userName} 👋</Text>
                        <View style={[styles.subtitleBadge, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.subtitle, { color: isDarkMode ? colors.background : colors.surface }]}>Votre tableau de bord prestataire</Text>
                        </View>
                    </View>
                </View>

                {/* Actions rapides en haut */}
                <View style={styles.topActions}>
                    <NotificationBell style={[styles.iconBtn, { backgroundColor: colors.primary }]} size={30} color={colors.surface} />
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.primary }]} onPress={toggleTheme}>
                        <MaterialCommunityIcons name={isDarkMode ? 'weather-sunny' : 'weather-night'} size={22} color={colors.surface} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.primary }]} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={22} color={colors.surface} />
                    </TouchableOpacity>
                </View>

                                {/* Prochain(s) événement(s) */}
                                <UpcomingEvents
                                    events={events}
                                    loading={eventsLoading}
                                    colors={colors}
                                    styles={styles}
                                />

                                {/* Résumé interactif */}
                                <ChiffreAffaireCard caMois={caMois} caGlobal={caGlobal} caAnnee={caAnnee} caMoisN1={caMoisN1} />
                                <SummaryGridCard
                                        biensCount={biensCount}
                                        reservationsCount={reservationsCount}
                                        tacheCount={tacheCount}
                                        prestationsTerminees={prestationsTerminees}
                                />

                                {/* Actions principales en grille 2x2 */}
                                <QuickActionsGridCard
                                    onAddBien={() => setAddBienModalVisible(true)}
                                    onAddTache={() => navigation && navigation.navigate('TachesScreen')}
                                    onAddReservation={() => setAddReservationModalVisible(true)}
                                    onAddPrestation={() => setAddPrestationModalVisible(true)}
                                    onGoToDevis={handleGoToListeDevis}
                                    onGoToFacture={handleGoToListeFacture}
                                    onGoToPlanning={handleGoToPlanning}
                        />
            </ScrollView>
            {/* Modales gérées séparément (AddBien/AddTaches/AddReservations/AddPrestation) */}
        {/* Modal d'ajout de bien */}
        <AddBienModal
            visible={addBienModalVisible}
            onClose={() => setAddBienModalVisible(false)}
            onSuccess={() => setAddBienModalVisible(false)}
        />
        {/* Modal d'ajout de tâche supprimée, redirection vers TachesScreen */}
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

import { styles } from './styles/Homescreen.styles';

export default HomeScreen;
