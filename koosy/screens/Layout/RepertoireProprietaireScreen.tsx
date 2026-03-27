
// Répertoire des propriétaires.
// - Charge la liste via l'API
// - Permet la recherche, le tri et l'édition/suppression des propriétaires.
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ProprietaireList from '../../components/ProprietaireList';
import AddProprietaireModal from '../../components/modals/AddProprietaireModal';
import SearchBar from '../../ui/SearchBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProprietaires, deleteProprietaire, updateProprietaire } from '../../utils/api';
import type { Proprietaire } from '../../models/proprietaire';

function RepertoireProprietaireScreen() {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProprietaires = () => {
    setLoading(true);
    getProprietaires().then(setProprietaires).finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchProprietaires();
  }, []);

  const handleDeleteProprietaire = (id: number) => {
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
              // Optionnel: afficher une erreur/toast
              console.error('Erreur suppression propriétaire', e);
            }
          },
        },
      ]
    );
  };

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
  const handleEditProprietaire = async (id: number, data: Partial<Proprietaire>) => {
    try {
      await updateProprietaire(id, data);
      fetchProprietaires();
      Alert.alert('Succès', 'Propriétaire modifié avec succès');
    } catch (e) {
      // Optionnel: afficher une erreur/toast
      console.error('Erreur édition propriétaire', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header sticky comme BiensScreen */}
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Propriétaires</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>

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

      {/* Liste filtrée et triée */}
      <ProprietaireList
        data={filteredProprietaires}
        loading={loading}
        onDelete={handleDeleteProprietaire}
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
    borderColor: '#eee',
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
