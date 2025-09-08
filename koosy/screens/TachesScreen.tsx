import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
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

const MOCK_TACHES: Tache[] = [
  { id: 't1', titre: 'Réparer la porte', description: 'La porte d’entrée est cassée.', statut: 'à faire', dateEcheance: '10/09/2025' },
  { id: 't2', titre: 'Nettoyage annuel', description: 'Nettoyer les parties communes.', statut: 'en cours', dateEcheance: '15/09/2025' },
  { id: 't3', titre: 'Contrôle chaudière', description: 'Vérifier la chaudière.', statut: 'à faire', dateEcheance: '30/09/2025' },
];

function TachesScreen() {
  const { colors } = useTheme();
  const [taches, setTaches] = useState<Tache[]>(MOCK_TACHES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTache, setEditTache] = useState<Tache | null>(null);
  const [form, setForm] = useState<{ titre: string; description: string; statut: string; dateEcheance?: string }>({ titre: '', description: '', statut: 'à faire', dateEcheance: '' });

  // Ajout ou modification
  const openModal = (tache?: Tache) => {
    if (tache) {
      setEditTache(tache);
      setForm({ titre: tache.titre, description: tache.description, statut: tache.statut, dateEcheance: tache.dateEcheance });
    } else {
      setEditTache(null);
      setForm({ titre: '', description: '', statut: 'à faire', dateEcheance: '' });
    }
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setEditTache(null);
  };
  const handleSave = () => {
    if (!form.titre.trim()) return;
    if (editTache) {
      setTaches(taches.map(t => t.id === editTache.id ? {
        ...editTache,
        ...form,
        statut: form.statut as "à faire" | "en cours" | "terminée"
      } : t));
    } else {
      const newTache: Tache = {
        id: 't' + Date.now(),
        titre: form.titre,
        description: form.description,
        statut: form.statut as "à faire" | "en cours" | "terminée",
        dateEcheance: form.dateEcheance,
      };
      setTaches([...taches, newTache]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    setTaches(taches.filter(t => t.id !== id));
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
                <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
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
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => openModal()}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
      </TouchableOpacity>
      {/* Modal ajout/modif */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>{editTache ? 'Modifier la tâche' : 'Ajouter une tâche'}</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Titre"
              placeholderTextColor={colors.textSecondary}
              value={form.titre}
              onChangeText={v => setForm(f => ({ ...f, titre: v }))}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
            />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Statut :</Text>
            <View style={styles.statutRow}>
              {STATUTS.map(s => (
                <TouchableOpacity key={s.key} style={[styles.statutBtn, form.statut === s.key && { backgroundColor: s.color }]} onPress={() => setForm(f => ({ ...f, statut: s.key }))}>
                  <Text style={{ color: form.statut === s.key ? '#fff' : colors.textSecondary, fontSize: 12 }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Date d'échéance (JJ/MM/AAAA)"
              placeholderTextColor={colors.textSecondary}
              value={form.dateEcheance}
              onChangeText={v => setForm(f => ({ ...f, dateEcheance: v }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={{ color: colors.surface, fontWeight: 'bold' }}>{editTache ? 'Enregistrer' : 'Ajouter'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.error }]} onPress={closeModal}>
                <Text style={{ color: colors.surface }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
