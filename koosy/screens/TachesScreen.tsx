import { createTache, getTaches, deleteTache, markTacheAsTerminee, updateTacheStatut } from '../utils/api';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AddTachesModal from '../components/AddTachesModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STATUTS = [
  { key: 'à faire', label: 'À faire', color: '#FF7043' },
  { key: 'terminée', label: 'Terminée', color: '#43A047' },
];

type Tache = {
  id: string;
  titre: string;
  description: string;
  statut: "à faire" | "en cours" | "terminée";
  dateEcheance?: string;
};

function TachesScreen() {
  const { colors } = useTheme();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    const fetchTaches = async () => {
      try {
        const data = await getTaches();
        setTaches(data.map((t: any) => ({
          id: t.id?.toString() || '',
          titre: t.titre,
          description: t.description || '',
          statut: t.statut,
          dateEcheance: t.dateEcheance || '',
        })));
      } catch (err) {
        setTaches([]);
      }
    };
    fetchTaches();
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
    }))));
  };

  const handleDelete = async (id: string) => {
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
              setSuccessMsg('Tâche supprimée avec succès');
              setTimeout(() => setSuccessMsg(''), 1800);
            } catch (err) {
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
      setSuccessMsg('Tâche marquée comme terminée');
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch (err) {
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
      setSuccessMsg(`Tâche marquée comme "${statut}"`);
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de changer le statut de la tâche.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={taches}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Aucune tâche</Text>}
        renderItem={({ item }) => {
          const statutObj = STATUTS.find(s => s.key === item.statut) || STATUTS[0];
          const isTerminee = item.statut === 'terminée';
          return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}> 
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.titre}</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              {item.dateEcheance ? <Text style={[styles.cardDate, { color: colors.textSecondary }]}>Échéance : {item.dateEcheance}</Text> : null}
              <View style={[styles.cardActions, { flexDirection: 'row', alignItems: 'center' }]}> 
                <TouchableOpacity style={styles.actionBtn} onPress={handleDelete.bind(null, item.id)}>
                  <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                </TouchableOpacity>
                {/* Badge "À faire" */}
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
                {/* Badge "Terminée" */}
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
      {/* Bouton flottant ajout */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openModal}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
      </TouchableOpacity>
      {/* Modal ajout/modif avec sélecteur de biens */}
      <AddTachesModal
        visible={modalVisible}
        onClose={closeModal}
        onSuccess={closeModal}
      />
      {successMsg ? (
        <Text style={{ color: colors.success, textAlign: 'center', marginVertical: 8 }}>{successMsg}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  cardDate: { fontSize: 12, marginBottom: 2 },
  statutBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  actionBtn: { padding: 8, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)' },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});

export default TachesScreen;
