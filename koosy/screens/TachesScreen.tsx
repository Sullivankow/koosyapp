import { getTaches, deleteTache, markTacheAsTerminee, updateTacheStatut } from '../utils/api';
import { useTacheCount } from '../contexts/TacheCountContext';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AddTachesModal from '../components/AddTachesModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';



type Tache = {
  id: string;
  titre: string;
  description: string;
  statut: "à faire" | "en cours" | "terminée";
  dateEcheance?: string;
  bienTitre?: string; // Titre du bien associé
};

function TachesScreen() {

  const { colors } = useTheme();
  const { refreshTacheCount } = useTacheCount();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'à faire' | 'terminée'>('à faire');

  React.useEffect(() => {
    getTaches()
      .then(data => setTaches(data.map((t: any) => ({
        id: t.id?.toString() || '',
        titre: t.titre,
        description: t.description || '',
        statut: t.statut,
        dateEcheance: t.dateEcheance || '',
        bienTitre: t.bien?.nom || '',
      }))))
      .catch(() => setTaches([]));
  }, []);


  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    getTaches().then(data => setTaches(data.map((t: any) => ({
      id: t.id?.toString() || '',
      titre: t.titre,
      description: t.description || '',
      statut: t.statut,
      dateEcheance: t.dateEcheance || '',
      bienTitre: t.bien?.nom || '',
    }))));
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette tâche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTache(id);
              const data = await getTaches();
              setTaches(data.map((t: any) => ({
                id: t.id?.toString() || '',
                titre: t.titre,
                description: t.description || '',
                statut: t.statut,
                dateEcheance: t.dateEcheance || '',
              })));
            } catch {
              Alert.alert('Erreur', "La suppression a échoué.");
            }
          }
        }
      ]
    );
  };

  const handleMarkTerminee = async (id: string) => {
    try {
      await markTacheAsTerminee(id);
      const data = await getTaches();
      setTaches(data.map((t: any) => ({
        id: t.id?.toString() || '',
        titre: t.titre,
        description: t.description || '',
        statut: t.statut,
        dateEcheance: t.dateEcheance || '',
      })));
      await refreshTacheCount();
    } catch {
      Alert.alert('Erreur', "Impossible de marquer la tâche comme terminée.");
    }
  };

  const handleMarkStatut = async (id: string, statut: string) => {
    try {
      await updateTacheStatut(id, statut);
      const data = await getTaches();
      setTaches(data.map((t: any) => ({
        id: t.id?.toString() || '',
        titre: t.titre,
        description: t.description || '',
        statut: t.statut,
        dateEcheance: t.dateEcheance || '',
      })));
      await refreshTacheCount();
    } catch {
      Alert.alert('Erreur', "Impossible de changer le statut de la tâche.");
    }
  };

// Formatage simple de la date en DD/MM/YYYY
function formatDateFr(dateStr?: string) {
  if (!dateStr) return '';
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

  // Tri des tâches : statut (à faire, en cours, terminée) puis date d'échéance (plus proche d'abord)
  const statutOrder: Record<string, number> = { 'à faire': 0, 'en cours': 1, 'terminée': 2 };
  // Filtrage selon l'onglet sélectionné
  const filteredTaches = taches.filter(t =>
    selectedTab === 'à faire' ? t.statut !== 'terminée' : t.statut === 'terminée'
  );
  const sortedTaches = [...filteredTaches].sort((a, b) => {
    if (statutOrder[a.statut] !== statutOrder[b.statut]) {
      return statutOrder[a.statut] - statutOrder[b.statut];
    }
    const dateA = a.dateEcheance ? new Date(a.dateEcheance) : new Date(8640000000000000);
    const dateB = b.dateEcheance ? new Date(b.dateEcheance) : new Date(8640000000000000);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'à faire' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('à faire')}
        >
          <Text style={[styles.tabText, selectedTab === 'à faire' && styles.tabTextActive]}>À faire</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, selectedTab === 'terminée' && styles.tabBtnActive]}
          onPress={() => setSelectedTab('terminée')}
        >
          <Text style={[styles.tabText, selectedTab === 'terminée' && styles.tabTextActive]}>Terminée</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedTaches}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Aucune tâche</Text>}
        renderItem={({ item }) => {
          const isTerminee = item.statut === 'terminée';
          const dateAffichee = item.dateEcheance ? formatDateFr(item.dateEcheance) : '';
          return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}> 
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.titre}</Text>
              </View>
              {/* Titre du bien associé */}
              {item.bienTitre ? (
                <Text style={[styles.cardBien, { color: '#1976D2' }]}>Bien : {item.bienTitre}</Text>
              ) : null}
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              {dateAffichee ? (
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>Échéance : {dateAffichee}</Text>
              ) : null}
              <View style={styles.cardActions}> 
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMarkStatut(item.id, 'à faire')}
                  activeOpacity={0.7}
                  style={{
                    borderWidth: 2,
                    borderColor: '#FF7043',
                    borderRadius: 12,
                    marginLeft: 8,
                    opacity: item.statut === 'à faire' ? 1 : 0.5,
                  }}
                >
                  <View style={[styles.statutBadge, { backgroundColor: '#FF7043', minWidth: 80, alignItems: 'center', justifyContent: 'center' }]}> 
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>À faire</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => !isTerminee && handleMarkTerminee(item.id)}
                  activeOpacity={0.7}
                  style={{
                    borderWidth: 2,
                    borderColor: '#43A047',
                    borderRadius: 12,
                    marginLeft: 8,
                    opacity: isTerminee ? 1 : 0.5,
                  }}
                >
                  <View style={[styles.statutBadge, { backgroundColor: '#43A047', minWidth: 90, alignItems: 'center', justifyContent: 'center' }]}> 
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Terminée</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openModal}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
      </TouchableOpacity>
      <AddTachesModal
        visible={modalVisible}
        onClose={closeModal}
        onSuccess={closeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#eee',
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FF7043',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardDesc: { fontSize: 14, marginBottom: 6 },
  cardBien: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  cardDate: { fontSize: 12, marginBottom: 2 },
  statutBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  actionBtn: { padding: 8, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)' },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});

export default TachesScreen;
