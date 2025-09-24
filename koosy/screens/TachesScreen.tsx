import { createTache, getTaches, deleteTache } from '../utils/api';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AddTachesModal from '../components/AddTachesModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STATUTS = [
  { key: 'à faire', label: 'À faire', color: '#FF7043' },
  { key: 'en cours', label: 'En cours', color: '#448AFF' },
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

  // Suppression de la gestion locale du formulaire et de l’édition

  // Récupérer les vraies tâches au chargement
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

  // Nouvelle gestion de la modal
  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    // Rafraîchir la liste à chaque fermeture de la modal
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
  const handleStatutChange = (id: string, statut: string) => {
    setTaches(taches.map(t => t.id === id ? { ...t, statut: statut as "à faire" | "en cours" | "terminée" } : t));
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
          return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.titre}</Text>
                <View style={[styles.statutBadge, { backgroundColor: statutObj.color }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{statutObj.label}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              {item.dateEcheance ? <Text style={[styles.cardDate, { color: colors.textSecondary }]}>Échéance : {item.dateEcheance}</Text> : null}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={openModal}>
                  <MaterialCommunityIcons name="pencil" size={18} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                </TouchableOpacity>
                <View style={styles.statutRow}>
                  {STATUTS.map(s => (
                    <TouchableOpacity key={s.key} style={[styles.statutBtn, item.statut === s.key && { backgroundColor: s.color }]} onPress={() => handleStatutChange(item.id, s.key)}>
                      <Text style={{ color: item.statut === s.key ? '#fff' : colors.textSecondary, fontSize: 12 }}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
        onSuccess={() => {
          getTaches().then(data => setTaches(data.map((t: any) => ({
            id: t.id?.toString() || '',
            titre: t.titre,
            description: t.description || '',
            statut: t.statut,
            dateEcheance: t.dateEcheance || '',
          }))));
        }}
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
  statutRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  statutBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#eee', marginRight: 4, marginBottom: 4 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
  modalBox: { width: '90%', borderRadius: 18, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
});

export default TachesScreen;
