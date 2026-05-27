// Repertoire des proprietaires.
// La page conserve les fonctionnalites existantes : ajout avec quota, recherche,
// tri, edition via modale, suppression et paywall premium.
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import OwnerList from '../../components/OwnerList';
import AddProprietaireModal from '../../components/modals/AddProprietaireModal';
import OwnerEditModal from '../../components/modals/OwnerEditModal';
import SubscriptionPaywallModal from '../../components/modals/SubscriptionPaywallModal';
import {
  getProprietaires,
  deleteProprietaire,
  updateProprietaire,
  getProprietaireQuota,
  type ProprietaireQuota,
} from '../../utils/proprietaireApi';
import type { Proprietaire } from '../../models/models';

type SortOrder = 'asc' | 'desc';

function RepertoireProprietaireScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Proprietaire | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [proprioQuota, setProprioQuota] = useState<ProprietaireQuota | null>(null);

  // Charge la liste depuis l'API existante. Le backend renvoie les champs de contact,
  // mais pas les biens rattaches, donc la page reste volontairement centree contact.
  const fetchProprietaires = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getProprietaires();
      setProprietaires(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuota = useCallback(async () => {
    try {
      const quota = await getProprietaireQuota();
      setProprioQuota(quota);
    } catch {
      setProprioQuota(null);
    }
  }, []);

  useEffect(() => {
    fetchProprietaires();
    fetchQuota();
  }, [fetchProprietaires, fetchQuota]);

  const isQuotaReached = Boolean(proprioQuota?.isLimited && (proprioQuota.remaining ?? 0) <= 0);

  const filteredProprietaires = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const list = proprietaires.filter((proprietaire) => {
      if (!normalizedSearch) return true;

      return (
        String(proprietaire.nom || '').toLowerCase().includes(normalizedSearch) ||
        String(proprietaire.prenom || '').toLowerCase().includes(normalizedSearch) ||
        String(proprietaire.email || '').toLowerCase().includes(normalizedSearch) ||
        String(proprietaire.telephone || '').toLowerCase().includes(normalizedSearch) ||
        String(proprietaire.adresse || '').toLowerCase().includes(normalizedSearch)
      );
    });

    return [...list].sort((a, b) => {
      const labelA = `${a.nom || ''} ${a.prenom || ''}`.trim().toLowerCase();
      const labelB = `${b.nom || ''} ${b.prenom || ''}`.trim().toLowerCase();
      return sortOrder === 'asc' ? labelA.localeCompare(labelB) : labelB.localeCompare(labelA);
    });
  }, [proprietaires, search, sortOrder]);

  const handleDeleteProprietaire = useCallback((id: number) => {
    Alert.alert(
      'Confirmation',
      'Etes-vous sur de vouloir supprimer ce proprietaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProprietaire(id);
              await fetchProprietaires();
              await fetchQuota();
            } catch (e) {
              console.error('Erreur suppression proprietaire', e);
            }
          },
        },
      ],
    );
  }, [fetchProprietaires, fetchQuota]);

  // Accepte un payload optionnel pour rester compatible avec l'ancien OwnerList,
  // tout en evitant un PUT vide qui est refuse par le backend.
  const handleEditProprietaire = useCallback(async (id: number, data?: Partial<Proprietaire>) => {
    if (!data || Object.keys(data).length === 0) return;

    try {
      await updateProprietaire(id, data);
      await fetchProprietaires();
      Alert.alert('Succes', 'Proprietaire modifie avec succes');
    } catch (e) {
      console.error('Erreur edition proprietaire', e);
    }
  }, [fetchProprietaires]);

  const handleOpenAddModal = useCallback(() => {
    if (isQuotaReached) {
      setShowPaywall(true);
      return;
    }
    setShowAddModal(true);
  }, [isQuotaReached]);

  const handleOpenEdit = useCallback((owner: Proprietaire) => {
    setEditingOwner(owner);
    setShowEditModal(true);
  }, []);

  const listHeader = useMemo(() => (
    <View>
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroEyebrow}>Carnet proprietaires</Text>
            <Text style={styles.heroTitle}>Proprietaires</Text>
          </View>
          <TouchableOpacity accessibilityLabel="Ajouter proprietaire" style={[styles.heroAddBtn, { backgroundColor: colors.surface }]} onPress={handleOpenAddModal}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{proprietaires.length}</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{proprioQuota?.limit ?? '∞'}</Text>
            <Text style={styles.statLabel}>Limite</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</Text>
            <Text style={styles.statLabel}>Tri actif</Text>
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
              placeholder="Rechercher nom, email, telephone..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: colors.primary }]}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <MaterialCommunityIcons name={sortOrder === 'asc' ? 'sort-alphabetical-ascending' : 'sort-alphabetical-descending'} size={21} color={colors.surface} />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersRow}>
          <View style={[styles.filterChip, { backgroundColor: `${colors.primary}16`, borderColor: `${colors.primary}44` }]}>
            <Text style={[styles.filterChipText, { color: colors.primary }]}>Tous</Text>
          </View>
          <View style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>Email</Text>
          </View>
          <View style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>Telephone</Text>
          </View>
          <View style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.filterChipText, { color: colors.textSecondary }]}>Adresse</Text>
          </View>
        </View>
      </View>

      {isQuotaReached ? (
        <View style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.upgradeIcon, { backgroundColor: `${colors.secondary}18` }]}>
            <MaterialCommunityIcons name="crown" size={19} color={colors.secondary} />
          </View>
          <View style={styles.upgradeCopy}>
            <Text style={[styles.upgradeTitle, { color: colors.text }]}>
              Limite atteinte: {proprioQuota?.used ?? 5}/{proprioQuota?.limit ?? 5} proprietaires utilises
            </Text>
            <Text style={[styles.upgradeText, { color: colors.textSecondary }]}>
              Passez au premium pour continuer a ajouter des proprietaires.
            </Text>
          </View>
          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]} onPress={() => setShowPaywall(true)}>
            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.surface} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.listTitleRow}>
        <Text style={[styles.listTitle, { color: colors.text }]}>Repertoire</Text>
        <Text style={[styles.listMeta, { color: colors.primary }]}>{filteredProprietaires.length} resultats</Text>
      </View>
    </View>
  ), [
    colors.background,
    colors.border,
    colors.primary,
    colors.secondary,
    colors.shadow,
    colors.surface,
    colors.text,
    colors.textSecondary,
    filteredProprietaires.length,
    handleOpenAddModal,
    isQuotaReached,
    proprietaires.length,
    proprioQuota?.limit,
    proprioQuota?.used,
    search,
    sortOrder,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <OwnerList
        data={filteredProprietaires}
        loading={loading}
        ListHeaderComponent={listHeader}
        onDelete={handleDeleteProprietaire}
        onOpenEdit={handleOpenEdit}
        onEdit={handleEditProprietaire}
      />

      <AddProprietaireModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchProprietaires();
          fetchQuota();
        }}
      />
      <OwnerEditModal
        visible={showEditModal}
        owner={editingOwner}
        onClose={() => {
          setShowEditModal(false);
          setEditingOwner(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setEditingOwner(null);
          fetchProprietaires();
        }}
      />
      <SubscriptionPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 74,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
  },
  heroAddBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 3,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '800',
  },
  controlPanel: {
    marginHorizontal: 18,
    marginTop: -52,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    paddingVertical: 0,
    fontSize: 14,
    fontWeight: '700',
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '900',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeCopy: {
    flex: 1,
    minWidth: 0,
  },
  upgradeTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  upgradeText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  upgradeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitleRow: {
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  listMeta: {
    fontSize: 12,
    fontWeight: '900',
  },
});

export default RepertoireProprietaireScreen;
