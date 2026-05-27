// Ecran listant tous les biens de l'utilisateur.
// La refonte garde les fonctionnalites existantes :
// ajout, recherche, tri, filtre local, edition inline, suppression, statut, zoom photo et quota premium.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import BienCard from '../../components/cards/biens/BienCard';
import StatusModal, { StatusValue } from '../../components/modals/StatusModal';
import AddBienModal from '../../components/modals/AddBienModal';
import SubscriptionPaywallModal from '../../components/modals/SubscriptionPaywallModal';
import SuccesMessage from '../../components/SuccesMessage';

import { useTheme } from '../../contexts/ThemeContext';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTache } from '../../contexts/TacheContext';
import { useTacheCount } from '../../contexts/TacheCountContext';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { useGlobalRefresh } from '../../contexts/GlobalRefreshContext';
import useBiens from '../../hooks/useBiens';
import useBiensSearchSort from '../../hooks/useBiensSearchSort';

import { Bien } from '../../models/models';
import { styles } from './styles/BienScreen.styles';
import { getChiffreAffaire } from '../../utils/prestationsApi';
import { getBienQuota } from '../../utils/bienApi';
import type { BienQuota } from '../../utils/bienApi';

type BienStatusFilter = 'tous' | StatusValue | 'avec_reservation';

/**
 * BiensScreen
 *
 * Affiche la liste paginée des biens, propose recherche/tri/filtre local,
 * édition inline, changement de statut et visualisation des photos.
 * Les callbacks exposés (onEdit/onDelete/onStatus) sont memoisés pour limiter
 * les rerenders des cartes.
 */
const PAGE_SIZE = 20;

const BiensScreen: React.FC = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const focusBienId = route?.params?.focusBienId as string | undefined;
  const listRef = useRef<any>(null);

  const { colors } = useTheme();
  const { lastBienAdded, signalBienAdded } = useBienCount();
  const { lastTacheAdded } = useTache();
  const { tacheCount } = useTacheCount();
  const { prestationsTerminees } = usePrestationsCount();
  const { signalRefresh } = useGlobalRefresh();

  const [statutModalVisible, setStatutModalVisible] = useState(false);
  const [currentStatusBienId, setCurrentStatusBienId] = useState<string | null>(null);
  const [currentBienStatus, setCurrentBienStatus] = useState<StatusValue | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BienStatusFilter>('tous');
  const [page, setPage] = useState(1);
  const [addBienModalVisible, setAddBienModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [totalPerBienMap, setTotalPerBienMap] = useState<Record<string, number>>({});
  const totalPerBienMapRef = useRef<Record<string, number>>({});
  const [bienQuota, setBienQuota] = useState<BienQuota | null>(null);
  const [showSubscriptionPaywall, setShowSubscriptionPaywall] = useState(false);

  // Stabilise la palette transmise aux cartes pour limiter les re-renders de FlatList.
  const stableColors = useMemo(() => colors, [
    colors.background,
    colors.surface,
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.error,
    colors.success,
    colors.text,
    colors.textSecondary,
    colors.border,
    colors.shadow,
  ]);

  // Charge la liste complete des biens avec les relations deja exposees par le backend.
  const { biens, fetchBiens, updateBienById, deleteBienById, loading } = useBiens([
    lastBienAdded,
    lastTacheAdded,
    tacheCount,
    prestationsTerminees,
  ]);

  // Filtrage local : evite de solliciter le backend a chaque frappe dans la recherche.
  const filteredBiens = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return biens.filter((bien) => {
      const matchesSearch =
        !normalizedSearch ||
        String(bien.nom || '').toLowerCase().includes(normalizedSearch) ||
        String(bien.adresse || '').toLowerCase().includes(normalizedSearch) ||
        String(bien.type || '').toLowerCase().includes(normalizedSearch) ||
        String(bien.proprio?.nom || '').toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'tous' ||
        (statusFilter === 'avec_reservation'
          ? Boolean(bien.reservations && bien.reservations.length > 0)
          : bien.statut === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [biens, search, statusFilter]);

  const { sortOrder, setSortOrder, sortedBiens } = useBiensSearchSort(filteredBiens);
  const paginatedBiens = useMemo(() => sortedBiens.slice(0, page * PAGE_SIZE), [sortedBiens, page]);

  // Stats du portefeuille affichees dans le hero, recalculees uniquement quand la liste change.
  const biensStats = useMemo(() => {
    return biens.reduce(
      (acc, bien) => {
        acc.total += 1;
        if (bien.statut === 'disponible') acc.disponibles += 1;
        if (bien.statut === 'occupé') acc.occupes += 1;
        if (bien.statut === 'travaux') acc.travaux += 1;
        return acc;
      },
      { total: 0, disponibles: 0, occupes: 0, travaux: 0 }
    );
  }, [biens]);

  const isQuotaReached = useMemo(() => Boolean(
    bienQuota?.isLimited && (bienQuota.remaining ?? 0) <= 0,
  ), [bienQuota]);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => {
      const nextSize = prev * PAGE_SIZE;
      return nextSize >= sortedBiens.length ? prev : prev + 1;
    });
  }, [sortedBiens.length]);

  // Quand l'utilisateur change les criteres, on repart du debut de la pagination locale.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortOrder]);

  // Si l'ecran est ouvert avec focusBienId, on scrolle vers le bien cible apres le tri.
  useEffect(() => {
    if (focusBienId && sortedBiens.length > 0 && listRef.current) {
      const index = sortedBiens.findIndex((b: any) => b.id === focusBienId);
      if (index >= 0) {
        setTimeout(() => {
          try {
            listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
          } catch {
            try {
              listRef.current.scrollToOffset({ offset: 320 * index, animated: true });
            } catch {}
          }
        }, 300);
      }
      navigation.setParams({ focusBienId: undefined });
    }
  }, [focusBienId, navigation, sortedBiens]);

  // Charge les totaux historiques des prestations terminees par bien via l'endpoint agrege.
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
        totalPerBienMapRef.current = nextMap;
      } catch {
        setTotalPerBienMap({});
        totalPerBienMapRef.current = {};
      }
    };

    loadTotalsPerBien();
  }, [prestationsTerminees, lastBienAdded]);

  // Recupere le quota pour conserver le comportement premium/gratuit existant.
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

  const handleAddBienPress = useCallback(() => {
    if (isQuotaReached) {
      setShowSubscriptionPaywall(true);
      return;
    }
    setAddBienModalVisible(true);
  }, [isQuotaReached]);

  /**
   * formatDateFR - renvoie une date formatée pour l'affichage FR.
   * Gère les valeurs invalides en renvoyant une chaîne vide ou la valeur d'origine.
   */
  const formatDateFR = useCallback((dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || '';
    return d.toLocaleDateString('fr-FR');
  }, []);

  // Sauvegarde l'edition inline d'une carte en gardant le payload attendu par le DTO backend.
  /**
   * handleEditBienInline - sauvegarde une modification inline d'un bien.
   * Construit le payload attendu par l'API et déclenche un signal de refresh.
   */
  const handleEditBienInline = useCallback(async (bienModifie: Bien) => {
    try {
      const payload: any = {
        ...bienModifie,
        proprietaireNom: bienModifie.proprio?.nom || '',
        proprietaireEmail: bienModifie.proprio?.email || '',
        proprietaireTelephone: bienModifie.proprio?.telephone || '',
      };
      await updateBienById(bienModifie.id, payload);
      setSuccessMsg('Bien modifie avec succes !');
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch (e) {
      // Logguer en WARN pour conserver un feedback en dev sans casser l'app.
      console.warn('Erreur updateBienById:', e);
      setSuccessMsg('Erreur lors de la modification du bien');
      setTimeout(() => setSuccessMsg(''), 1800);
    }
  }, [signalBienAdded, updateBienById]);

  const openStatusModal = useCallback((bien: Bien) => {
    setCurrentStatusBienId(bien.id);
    setCurrentBienStatus(bien.statut === 'disponible' || bien.statut === 'occupé' ? bien.statut : undefined);
    setStatutModalVisible(true);
  }, []);

  // Changement de statut : recharge le bien complet pour ne pas perdre les champs requis au PATCH.
  /**
   * handleSelectStatus - met à jour le statut d'un bien en récupérant
   * d'abord l'entité complète côté API pour préserver les champs requis.
   */
  const handleSelectStatus = useCallback(async (status: StatusValue) => {
    if (!currentStatusBienId) return;
    try {
      const bienApi = await import('../../utils/bienApi');
      const fullBien = await bienApi.getBienById(currentStatusBienId);
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
        equipements: Array.isArray(fullBien.equipements)
          ? fullBien.equipements
          : (fullBien.equipements ? String(fullBien.equipements).split(',').map((s: string) => s.trim()) : []),
        photos: fullBien.photos || fullBien.images || [],
        statut: status,
        lat: fullBien.lat,
        lng: fullBien.lng,
      } as any;
      await updateBienById(currentStatusBienId, payload);
      setSuccessMsg('Statut mis a jour');
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch {}
    finally {
      setStatutModalVisible(false);
      setCurrentStatusBienId(null);
      setCurrentBienStatus(undefined);
    }
  }, [currentStatusBienId, signalBienAdded, updateBienById]);

  /**
   * handleSupprimerBien - supprime un bien et signale le rafraîchissement global.
   */
  const handleSupprimerBien = useCallback(async (bienId: string) => {
    try {
      await deleteBienById(bienId);
      setSuccessMsg('Bien supprime avec succes !');
      signalBienAdded();
      signalRefresh();
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {}
  }, [deleteBienById, signalBienAdded, signalRefresh]);

  /**
   * handlePhotoPress - ouvre la modal d'affichage d'une photo.
   */
  const handlePhotoPress = useCallback((photo: any) => {
    setSelectedPhoto(photo);
    setPhotoModalVisible(true);
  }, []);

  /**
   * renderFilterChip - rend un bouton filtre pour le panneau de contrôle.
   */
  const renderFilterChip = useCallback((label: string, value: BienStatusFilter) => {
    const isActive = statusFilter === value;

    return (
      <TouchableOpacity
        key={value}
        onPress={() => setStatusFilter(value)}
        style={[
          styles.filterChip,
          {
            backgroundColor: isActive ? `${colors.primary}16` : colors.surface,
            borderColor: isActive ? `${colors.primary}44` : colors.border,
          },
        ]}
      >
        <Text style={[styles.filterChipText, { color: isActive ? colors.primary : colors.textSecondary }]}>{label}</Text>
      </TouchableOpacity>
    );
  }, [colors.border, colors.primary, colors.surface, colors.textSecondary, statusFilter]);

  /**
   * renderItem - wrapper stable utilisé par FlatList pour rendre chaque carte.
   * Les callbacks sont memoisés pour préserver l'identité et limiter les re-renders.
   */
  const renderItem = useCallback(
    ({ item }: { item: Bien }) => (
      <BienCard
        bien={item}
        colors={stableColors}
        onEdit={handleEditBienInline}
        onDelete={handleSupprimerBien}
        onStatus={openStatusModal}
        onPhotoPress={handlePhotoPress}
        formatDateFR={formatDateFR}
        totalPrestationPercu={totalPerBienMapRef.current[String(item.id)] ?? 0}
      />
    ),
    [formatDateFR, handleEditBienInline, handlePhotoPress, handleSupprimerBien, openStatusModal, stableColors]
  );

  // Header memoise pour que la FlatList conserve des cartes stables pendant les interactions.
  const listHeader = useMemo(() => (
    <View>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroEyebrow}>Portefeuille immobilier</Text>
            <Text style={styles.heroTitle}>Mes biens</Text>
          </View>
          <TouchableOpacity style={[styles.heroAddBtn, { backgroundColor: colors.surface }]} onPress={handleAddBienPress}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{biensStats.total}</Text>
            <Text style={styles.statLabel}>Biens actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{biensStats.disponibles}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{biensStats.occupes}</Text>
            <Text style={styles.statLabel}>Occupes</Text>
          </View>
        </View>
      </View>

      <View style={[styles.controlPanel, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un bien, une adresse..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.primary }]}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <MaterialCommunityIcons
              name={sortOrder === 'asc' ? 'sort-calendar-ascending' : 'sort-calendar-descending'}
              size={21}
              color={colors.surface}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersRow}>
          {renderFilterChip('Tous', 'tous')}
          {renderFilterChip('Disponibles', 'disponible')}
          {renderFilterChip('Occupes', 'occupé')}
          {renderFilterChip('Avec resa', 'avec_reservation')}
        </View>
      </View>

      {isQuotaReached ? (
        <View style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.upgradeIcon, { backgroundColor: `${colors.secondary}18` }]}>
            <MaterialCommunityIcons name="crown" size={19} color={colors.secondary} />
          </View>
          <View style={styles.upgradeCopy}>
            <Text style={[styles.upgradeTitle, { color: colors.text }]}>
              Limite atteinte: {bienQuota?.used ?? 5}/{bienQuota?.limit ?? 5} creations utilisees
            </Text>
            <Text style={[styles.upgradeText, { color: colors.textSecondary }]}>
              Passez au premium pour continuer a creer des biens sans limite.
            </Text>
          </View>
          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]} onPress={() => setShowSubscriptionPaywall(true)}>
            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.surface} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.listTitleRow}>
        <Text style={[styles.listTitle, { color: colors.text }]}>A superviser</Text>
        <Text style={[styles.listMeta, { color: colors.primary }]}>{paginatedBiens.length}/{sortedBiens.length}</Text>
      </View>
    </View>
  ), [
    bienQuota?.limit,
    bienQuota?.used,
    biensStats.disponibles,
    biensStats.occupes,
    biensStats.total,
    colors.background,
    colors.border,
    colors.primary,
    colors.secondary,
    colors.shadow,
    colors.surface,
    colors.text,
    colors.textSecondary,
    handleAddBienPress,
    isQuotaReached,
    paginatedBiens.length,
    renderFilterChip,
    search,
    sortOrder,
    sortedBiens.length,
    setSortOrder,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SuccesMessage message={successMsg} />

      {addBienModalVisible ? (
        <AddBienModal
          visible={addBienModalVisible}
          onClose={() => setAddBienModalVisible(false)}
          onSuccess={() => {
            fetchBiens();
            signalBienAdded();
            setAddBienModalVisible(false);
          }}
        />
      ) : null}

      <StatusModal
        visible={statutModalVisible}
        onClose={() => setStatutModalVisible(false)}
        onSelect={handleSelectStatus}
        currentStatus={currentBienStatus}
      />

      <FlatList
        ref={listRef}
        data={paginatedBiens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={!loading ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="home-search-outline" size={30} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun bien trouve</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Essayez une autre recherche ou un autre filtre.</Text>
          </View>
        ) : null}
        ListFooterComponent={loading ? (
          <View style={styles.loadingFooter}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
        renderItem={renderItem}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews={true}
        extraData={totalPerBienMap}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
      />

      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setPhotoModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto ? (
            <Image source={{ uri: selectedPhoto }} style={styles.modalPhoto} resizeMode="contain" />
          ) : null}
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
