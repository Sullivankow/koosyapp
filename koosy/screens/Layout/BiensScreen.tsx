// Écran listant tous les biens de l'utilisateur.
// - Récupère les biens via le hook `useBiens`
// - Gère la recherche, le tri, l'édition inline et la suppression
// - Permet aussi de modifier le statut d'un bien (disponible / occupé)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import BienCard from '../../components/cards/biens/BienCard';
import StatusModal, { StatusValue } from '../../components/modals/StatusModal';
import { useTheme } from '../../contexts/ThemeContext';

import { Bien } from '../../models/models';
import useBiens from '../../hooks/useBiens';
import useBiensSearchSort from '../../hooks/useBiensSearchSort';
import AddBienModal from '../../components/modals/AddBienModal';
import SearchBar from '../../ui/SearchBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuccesMessage from '../../components/SuccesMessage';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTache } from '../../contexts/TacheContext';
import { useTacheCount } from '../../contexts/TacheCountContext';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGlobalRefresh } from '../../contexts/GlobalRefreshContext';
import { styles } from './styles/BienScreen.styles';
import { getChiffreAffaire } from '../../utils/prestationsApi';
import { getBienQuota } from '../../utils/bienApi';
import type { BienQuota } from '../../utils/bienApi';
import SubscriptionPaywallModal from '../../components/modals/SubscriptionPaywallModal';

const BiensScreen: React.FC = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const focusBienId = route?.params?.focusBienId as string | undefined;
  const listRef = useRef<any>(null);
  const { lastBienAdded, signalBienAdded } = useBienCount();
  const { lastTacheAdded } = useTache();
  const { tacheCount } = useTacheCount();
  const { prestationsTerminees } = usePrestationsCount();
  const [statutModalVisible, setStatutModalVisible] = useState(false);
  const [currentStatusBienId, setCurrentStatusBienId] = useState<string | null>(null);
  const [currentBienStatus, setCurrentBienStatus] = useState<StatusValue | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [addBienModalVisible, setAddBienModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [editModalData, setEditModalData] = useState<{ visible: boolean; bienId?: string; initialData?: any }>({ visible: false });
  const [successMsg, setSuccessMsg] = useState('');
  const [totalPerBienMap, setTotalPerBienMap] = useState<Record<string, number>>({});
  const [bienQuota, setBienQuota] = useState<BienQuota | null>(null);
  const [showSubscriptionPaywall, setShowSubscriptionPaywall] = useState(false);
  const { colors } = useTheme();

  // Récupération des biens (ajout de tacheCount comme dépendance)
  const { biens, fetchBiens, updateBienById, deleteBienById } = useBiens([lastBienAdded, lastTacheAdded, tacheCount, prestationsTerminees]);

  // Recherche locale
  const filteredBiens = biens.filter(b =>
    b.nom.toLowerCase().includes(search.toLowerCase()) ||
    b.adresse.toLowerCase().includes(search.toLowerCase())
  );

  // Tri via hook personnalisé
  const { sortOrder, setSortOrder, sortedBiens } = useBiensSearchSort(filteredBiens);

  // Effet : si un identifiant de bien est passé en paramètre de navigation,
  // on scrolle automatiquement jusqu'à ce bien dans la liste.
  useEffect(() => {
    if (focusBienId && sortedBiens.length > 0 && listRef.current) {
      const index = sortedBiens.findIndex((b: any) => b.id === focusBienId);
      if (index >= 0) {
        setTimeout(() => {
          try {
            listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
          } catch (err) {
            try {
              const CARD_HEIGHT = 340;
              const offset = CARD_HEIGHT * index;
              listRef.current.scrollToOffset({ offset, animated: true });
            } catch {}
          }
        }, 300);
      }
      navigation.setParams({ focusBienId: undefined });
    }
  }, [focusBienId, sortedBiens]);

  // Charge les totaux historiques des prestations terminées par bien.
  // Un seul appel API agrégé, puis mapping bienId -> total_euros.
  useEffect(() => {
    const loadTotalsPerBien = async () => {
      try {
        const now = new Date().toISOString().slice(0, 10);
        const summary = await getChiffreAffaire('2000-01-01', now);
        const perBien = Array.isArray(summary?.perBien) ? summary.perBien : [];
        const nextMap: Record<string, number> = {};

        perBien.forEach((item: any) => {
          const id = String(item?.bienId ?? '');
          if (!id) return;
          nextMap[id] = Number(item?.total_euros ?? 0);
        });

        setTotalPerBienMap(nextMap);
      } catch {
        setTotalPerBienMap({});
      }
    };

    loadTotalsPerBien();
  }, [prestationsTerminees, lastBienAdded]);

  // Charge le quota de créations de biens pour savoir si l'utilisateur gratuit a atteint sa limite.
  useEffect(() => {
    const loadBienQuota = async () => {
      try {
        const quota = await getBienQuota();
        setBienQuota(quota);
      } catch {
        setBienQuota(null);
      }
    };

    loadBienQuota();
  }, [lastBienAdded]);

  // Indique si la limite de création est atteinte pour un compte limité (plan gratuit).
  const isQuotaReached = Boolean(
    bienQuota?.isLimited && (bienQuota.remaining ?? 0) <= 0,
  );

  // Gère le bouton "+" : ouvre la modale d'ajout si possible, sinon affiche directement l'offre d'abonnement.
  const handleAddBienPress = () => {
    if (isQuotaReached) {
      setShowSubscriptionPaywall(true);
      return;
    }
    setAddBienModalVisible(true);
  };

  // Formatage simple d'une date au format français (JJ/MM/AAAA)
  const formatDateFR = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || '';
    return d.toLocaleDateString('fr-FR');
  };

  // Gestion modales et callbacks
  // Enregistre en base les modifications d'un bien édité inline depuis la carte.
  const handleEditBienInline = async (bienModifie: Bien) => {
    try {
      await updateBienById(bienModifie.id, bienModifie);
      setSuccessMsg('Bien modifié avec succès !');
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch {
      setSuccessMsg("Erreur lors de la modification du bien");
      setTimeout(() => setSuccessMsg(''), 1800);
    }
  };
  // Ouvre la modale de choix de statut pour un bien donné.
  const openStatusModal = (bien: Bien) => {
    setCurrentStatusBienId(bien.id);
    // On ne conserve dans l'état que les statuts gérés par StatusModal
    setCurrentBienStatus(bien.statut === 'disponible' || bien.statut === 'occupé' ? bien.statut : undefined);
    setStatutModalVisible(true);
  };
  // Callback appelé depuis StatusModal lorsqu'un nouveau statut est sélectionné.
  // Récupère le bien complet via l'API, prépare un payload cohérent et met à jour le statut.
  const handleSelectStatus = async (status: StatusValue) => {
    if (!currentStatusBienId) return;
    try {
      const fullBien = await (await import('../../utils/bienApi')).getBienById(currentStatusBienId);
      if (!fullBien) throw new Error('Bien introuvable');
      const payload = {
        proprietaireNom: fullBien.proprietaireNom || fullBien.proprio?.nom || '',
        proprietaireEmail: fullBien.proprietaireEmail || fullBien.proprio?.email || '',
        proprietaireTelephone: fullBien.proprietaireTelephone || fullBien.proprio?.telephone || '',
        nom: fullBien.nom || '',
        adresse: fullBien.adresse || '',
        type: fullBien.type || '',
        superficie: Number(fullBien.superficie) || 0,
        pieces: Number(fullBien.pieces) || 0,
        equipements: Array.isArray(fullBien.equipements) ? fullBien.equipements : (fullBien.equipements ? String(fullBien.equipements).split(',').map((s: string) => s.trim()) : []),
        photos: fullBien.photos || fullBien.images || [],
        statut: status,
        lat: fullBien.lat,
        lng: fullBien.lng,
      } as any;
      await updateBienById(currentStatusBienId, payload);
      setSuccessMsg('Statut mis à jour');
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch {}
    finally {
      setStatutModalVisible(false);
      setCurrentStatusBienId(null);
      setCurrentBienStatus(undefined);
    }
  };
  const { signalRefresh } = useGlobalRefresh();
  // Supprime définitivement un bien puis déclenche un rafraîchissement global.
  const handleSupprimerBien = async (bienId: string) => {
    try {
      await deleteBienById(bienId);
      setSuccessMsg('Bien supprimé avec succès !');
      signalBienAdded();
      signalRefresh(); // Déclenche le rafraîchissement global
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {}
  };
  const handlePhotoPress = (photo: any) => { setSelectedPhoto(photo); setPhotoModalVisible(true); };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <SuccesMessage message={successMsg} />
      {addBienModalVisible && !editModalData.visible && (
        <AddBienModal
          visible={addBienModalVisible}
          onClose={() => setAddBienModalVisible(false)}
          onSuccess={() => { fetchBiens(); signalBienAdded(); }}
        />
      )}
      <StatusModal visible={statutModalVisible} onClose={() => setStatutModalVisible(false)} onSelect={handleSelectStatus} currentStatus={currentBienStatus} />
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Mes biens</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddBienPress}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>
      {/* Affiche une carte d'upgrade uniquement quand l'utilisateur gratuit a atteint la limite de créations. */}
      {isQuotaReached && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 2,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="crown" size={18} color={colors.primary} />
            <Text style={{ marginLeft: 8, fontWeight: '700', color: colors.text }}>
              Limite atteinte: {bienQuota?.used ?? 5}/{bienQuota?.limit ?? 5} créations utilisées
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>
            Passez au plan premium pour continuer à créer des biens sans limite.
          </Text>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
            onPress={() => setShowSubscriptionPaywall(true)}
          >
            <Text style={{ color: colors.surface, fontWeight: '700' }}>Voir l’abonnement</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un bien..."
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
        <TouchableOpacity
          style={{ marginLeft: 8, padding: 8, backgroundColor: colors.primary, borderRadius: 8 }}
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <MaterialCommunityIcons
            name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
            size={24}
            color={colors.surface}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={sortedBiens}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
        getItemLayout={(_, index) => ({ length: 340, offset: 340 * index, index })}
        renderItem={({ item }) => (
          <BienCard
            bien={item}
            colors={colors}
            onEdit={handleEditBienInline}
            onDelete={handleSupprimerBien}
            onStatus={openStatusModal}
            onPhotoPress={handlePhotoPress}
            formatDateFR={formatDateFR}
            totalPrestationPercu={totalPerBienMap[String(item.id)] ?? 0}
            // La carte n'a plus besoin de remonter les changements de statut de tâche ici
          />
        )}
      />
      {/* Suppression de la modale d'édition sur l'icône modifier */}
      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setPhotoModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={selectedPhoto} style={styles.modalPhoto} resizeMode="contain" />
          )}
        </View>
      </Modal>
      <SubscriptionPaywallModal
        isOpen={showSubscriptionPaywall}
        onClose={() => setShowSubscriptionPaywall(false)}
        onSubscribe={() => setShowSubscriptionPaywall(false)}
      />
    </View>
  );
};

export default BiensScreen;






