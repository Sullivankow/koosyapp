import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Reservation } from '../models/models';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock de locataires et biens (à relier plus tard)
const MOCK_LOCATAIRES = [
  { id: 'l1', nom: 'Alice Martin' },
  { id: 'l2', nom: 'Tom Leroy' },
];
const MOCK_BIENS = [
  { id: 'b1', nom: 'Appartement République' },
  { id: 'b2', nom: 'Studio Opéra' },
];

const statutColor = {
  'confirmée': '#43A047',
  'en attente': '#FF7043',
  'annulée': '#E53935',
};

// Fonction utilitaire pour formatage date FR
function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('fr-FR');
}

function CalendrierScreen() {
  const { colors } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'r1', bienId: 'b1', locataireId: 'l1', dateArrivee: '2025-09-10', dateDepart: '2025-09-15', heureArrivee: '14:00', heureDepart: '10:00', statut: 'confirmée'
    },
    {
      id: 'r2', bienId: 'b2', locataireId: 'l2', dateArrivee: '2025-09-12', dateDepart: '2025-09-18', heureArrivee: '16:00', heureDepart: '11:00', statut: 'en attente'
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<{ bienId: string; locataireId: string; dateArrivee: string; dateDepart: string; heureArrivee: string; heureDepart: string; statut: 'confirmée' | 'en attente' | 'annulée' }>(
    { bienId: '', locataireId: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' }
  );
  const [editId, setEditId] = useState<string | null>(null);

  // Ajout ou modif
  const handleSave = () => {
    if (!form.bienId || !form.locataireId || !form.dateArrivee || !form.dateDepart) return;
    if (editId) {
      setReservations(reservations.map(r => r.id === editId ? { ...r, ...form } : r));
    } else {
      setReservations([...reservations, { id: 'r' + Date.now(), ...form }]);
    }
    setModalVisible(false);
    setEditId(null);
    setForm({ bienId: '', locataireId: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' });
  };

  // Suppression
  const handleDelete = (id: string) => {
    setReservations(reservations.filter(r => r.id !== id));
    setModalVisible(false);
    setEditId(null);
  };

  // Ouvre modale ajout/modif
  const openModal = (reservation?: Reservation) => {
    if (reservation) {
      setEditId(reservation.id);
      setForm({
        bienId: reservation.bienId,
        locataireId: reservation.locataireId,
        dateArrivee: reservation.dateArrivee,
        dateDepart: reservation.dateDepart,
        heureArrivee: reservation.heureArrivee,
        heureDepart: reservation.heureDepart,
        statut: reservation.statut,
      });
    } else {
      setEditId(null);
      setForm({ bienId: '', locataireId: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' });
    }
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[styles.title, { color: colors.primary }]}>Réservations</Text>
      <FlatList
        data={reservations.sort((a, b) => a.dateArrivee.localeCompare(b.dateArrivee))}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Aucune réservation</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { borderLeftColor: statutColor[item.statut] }]} onPress={() => openModal(item)}>
            <Text style={[styles.cardTitle, { color: '#222B45' }]}>{MOCK_LOCATAIRES.find(l => l.id === item.locataireId)?.nom || item.locataireId}</Text>
            <Text style={{ color: colors.textSecondary }}>Bien : {MOCK_BIENS.find(b => b.id === item.bienId)?.nom || item.bienId}</Text>
            <Text style={{ color: colors.textSecondary }}>Arrivée : {formatDateFR(item.dateArrivee)} à {item.heureArrivee}</Text>
            <Text style={{ color: colors.textSecondary }}>Départ : {formatDateFR(item.dateDepart)} à {item.heureDepart}</Text>
            <Text style={{ color: statutColor[item.statut], fontWeight: 'bold' }}>Statut : {item.statut}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Bouton flottant ajout */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => openModal()}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
      </TouchableOpacity>
      {/* Modal ajout/modif */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>{editId ? 'Modifier' : 'Ajouter'} une réservation</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Locataire :</Text>
            <FlatList
              data={MOCK_LOCATAIRES}
              horizontal
              keyExtractor={l => l.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.chip, form.locataireId === item.id && { backgroundColor: colors.primary }]} onPress={() => setForm(f => ({ ...f, locataireId: item.id }))}>
                  <Text style={{ color: form.locataireId === item.id ? '#fff' : colors.text }}>{item.nom}</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Bien :</Text>
            <FlatList
              data={MOCK_BIENS}
              horizontal
              keyExtractor={b => b.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.chip, form.bienId === item.id && { backgroundColor: colors.secondary }]} onPress={() => setForm(f => ({ ...f, bienId: item.id }))}>
                  <Text style={{ color: form.bienId === item.id ? '#fff' : colors.text }}>{item.nom}</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Arrivée :</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
                value={form.dateArrivee}
                onChangeText={(v: string) => setForm(f => ({ ...f, dateArrivee: v }))}
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Heure (HH:mm)"
                placeholderTextColor={colors.textSecondary}
                value={form.heureArrivee}
                onChangeText={(v: string) => setForm(f => ({ ...f, heureArrivee: v }))}
              />
            </View>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Départ :</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
                value={form.dateDepart}
                onChangeText={(v: string) => setForm(f => ({ ...f, dateDepart: v }))}
              />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Heure (HH:mm)"
                placeholderTextColor={colors.textSecondary}
                value={form.heureDepart}
                onChangeText={(v: string) => setForm(f => ({ ...f, heureDepart: v }))}
              />
            </View>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Statut :</Text>
            <View style={styles.row}>
              {['confirmée', 'en attente', 'annulée'].map(s => (
                <TouchableOpacity key={s} style={[styles.chip, form.statut === s && { backgroundColor: statutColor[s] }]} onPress={() => setForm(f => ({ ...f, statut: s as any }))}>
                  <Text style={{ color: form.statut === s ? '#fff' : colors.text }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={{ color: colors.surface, fontWeight: 'bold' }}>{editId ? 'Enregistrer' : 'Ajouter'}</Text>
              </TouchableOpacity>
              {editId && (
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.error }]} onPress={() => handleDelete(editId)}>
                  <Text style={{ color: colors.surface }}>Supprimer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.disabled }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.surface }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: 'bold', margin: 18 },
  card: { borderRadius: 16, padding: 16, marginBottom: 18, elevation: 2, backgroundColor: '#fff', borderLeftWidth: 6 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
  modalBox: { width: '90%', borderRadius: 18, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginTop: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 15, minWidth: 120 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 18 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
});

export default CalendrierScreen;
