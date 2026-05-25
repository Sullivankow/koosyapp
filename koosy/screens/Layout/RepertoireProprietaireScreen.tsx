// Répertoire des propriétaires.
// - Charge la liste via l'API
// - Permet la recherche, le tri et l'édition/suppression des propriétaires.
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
// Legacy list (kept for reference): import ProprietaireList from '../../components/ProprietaireList';
import OwnerList from '../../components/OwnerList';
import AddProprietaireModal from '../../components/modals/AddProprietaireModal';
import OwnerEditModal from '../../components/modals/OwnerEditModal';
import SubscriptionPaywallModal from '../../components/modals/SubscriptionPaywallModal';
import { getProprietaireQuota, type ProprietaireQuota } from '../../utils/proprietaireApi';
import SearchBar from '../../ui/SearchBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProprietaires, deleteProprietaire, updateProprietaire } from '../../utils/proprietaireApi';
import type { Proprietaire } from '../../models/models';

function RepertoireProprietaireScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Proprietaire | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [proprioQuota, setProprioQuota] = useState<ProprietaireQuota | null>(null);

  const fetchProprietaires = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getProprietaires();
      setProprietaires(list);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charge la liste ET le quota au chargement
  React.useEffect(() => {
    fetchProprietaires();
    const loadQuota = async () => {
      try {
        const quota = await getProprietaireQuota();
        setProprioQuota(quota);
      } catch {
        setProprioQuota(null);
      }
    };
    loadQuota();
  }, [fetchProprietaires]);

  const handleDeleteProprietaire = useCallback((id: number) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce propriétaire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProprietaire(id);
              fetchProprietaires();
            } catch (e) {
              console.error('Erreur suppression propriétaire', e);
            }
          },
        },
      ]
    );
  }, [fetchProprietaires]);

  // Filtrage et tri local sur nom/prenom
  const filteredProprietaires = useMemo(() => {
    let list = proprietaires.filter(p =>
      (p.nom && p.nom.toLowerCase().includes(search.toLowerCase())) ||
      (p.prenom && p.prenom.toLowerCase().includes(search.toLowerCase()))
    );
    list = list.sort((a, b) => {
      const nomA = (a.nom + ' ' + a.prenom).toLowerCase();
      const nomB = (b.nom + ' ' + b.prenom).toLowerCase();
      if (sortOrder === 'asc') return nomA.localeCompare(nomB);
      return nomB.localeCompare(nomA);
    });
    return list;
  }, [proprietaires, search, sortOrder]);

  // Gestion édition propriétaire
  const handleEditProprietaire = useCallback(async (id: number, data: Partial<Proprietaire>) => {
    try {
      await updateProprietaire(id, data);
      fetchProprietaires();
      Alert.alert('Succès', 'Propriétaire modifié avec succès');
    } catch (e) {
      console.error('Erreur édition propriétaire', e);
    }
  }, [fetchProprietaires]);

  // Gestion ouverture modale d'ajout avec vérification du quota
  // Affiche le paywall si la limite est atteinte
  const isQuotaReached = Boolean(proprioQuota?.isLimited && (proprioQuota.remaining ?? 0) <= 0);
  const handleOpenAddModal = useCallback(async () => {
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header sticky révisé */}
      <View style={[styles.headerSticky, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}> 
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Propriétaires</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{proprietaires.length} propriétaire(s)</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Ajouter propriétaire" style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleOpenAddModal}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>
      {/* Affiche une carte d'upgrade uniquement quand la limite est atteinte, comme pour les biens */}
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
              Limite atteinte: {proprioQuota?.used ?? 5}/{proprioQuota?.limit ?? 5} propriétaires utilisés
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>
            Passez au plan premium pour continuer à ajouter des propriétaires sans limite.
          </Text>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
            onPress={() => setShowPaywall(true)}
          >
            <Text style={{ color: colors.surface, fontWeight: '700' }}>Voir l’abonnement</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barre de recherche et tri */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un propriétaire..."
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

      {/* Liste filtrée et triée (nouvelle UI) */}
      <OwnerList
        data={filteredProprietaires}
        onDelete={handleDeleteProprietaire}
        onOpenEdit={handleOpenEdit}
        onEdit={handleEditProprietaire}
      />

      {/* Modale d'ajout de propriétaire */}
      <AddProprietaireModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchProprietaires();
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
      {/* Floating Add Button removed — header contains the primary add action */}
      {/* Paywall modal */}
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
  headerSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    // borderBottomColor applied from theme at render time
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
  },
});

export default RepertoireProprietaireScreen;
