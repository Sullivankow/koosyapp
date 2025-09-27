import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Reservation, Bien, Locataire } from '../models/models';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBiens, createReservation } from '../utils/api';
import AddReservationsModal from '../components/AddReservationsModal';

const statutColor = {
  'confirmée': '#43A047',
  'en attente': '#FF7043',
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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [biens, setBiens] = useState<Bien[]>([]);
  // TODO: Remplacer ce mock par un appel API getLocataires quand dispo
  const [locataires, setLocataires] = useState<Locataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<{ bienId: string; locataireNom: string; locatairePrenom: string; locataireEmail: string; locataireTelephone: string; dateArrivee: string; dateDepart: string; heureArrivee: string; heureDepart: string; statut: 'confirmée' | 'en attente' }>(
    { bienId: '', locataireNom: '', locatairePrenom: '', locataireEmail: '', locataireTelephone: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' }
  );
  const [editId, setEditId] = useState<string | null>(null);
  const [tab, setTab] = useState<'en attente' | 'confirmée'>('en attente');

  useEffect(() => {
    // Charger les biens et les réservations (et locataires si API dispo)
    const fetchData = async () => {
      setLoading(true);
      try {
        const biensData = await getBiens();
        setBiens(biensData);
        // TODO: Remplacer par getReservations() quand dispo
        // setReservations(await getReservations());
        // TODO: Remplacer par getLocataires() quand dispo
        // setLocataires(await getLocataires());
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Ajout réel via API
  const handleSave = async () => {
    if (!form.bienId || !form.locataireNom || !form.locatairePrenom || !form.locataireEmail || !form.dateArrivee || !form.dateDepart) {
      Alert.alert('Champs manquants', 'Merci de remplir tous les champs obligatoires.');
      return;
    }
    try {
      await createReservation({
        bienId: Number(form.bienId),
        locataireNom: form.locataireNom,
        locatairePrenom: form.locatairePrenom,
        locataireEmail: form.locataireEmail,
        locataireTelephone: form.locataireTelephone,
        dateDebut: form.dateArrivee,
        dateFin: form.dateDepart,
        statut: form.statut,
      });
      setModalVisible(false);
      setForm({ bienId: '', locataireNom: '', locatairePrenom: '', locataireEmail: '', locataireTelephone: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' });
      // Recharger les réservations ici (quand getReservations dispo)
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la réservation.');
    }
  };

  // Ouvre modale ajout
  const openModal = () => {
    setEditId(null);
    setForm({ bienId: '', locataireNom: '', locatairePrenom: '', locataireEmail: '', locataireTelephone: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' });
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 8 }}>
            {(['en attente', 'confirmée'] as const).map(s => (
              <TouchableOpacity
                key={s}
                style={{
                  paddingHorizontal: 22,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginHorizontal: 8,
                  backgroundColor: tab === s ? statutColor[s] : colors.surface,
                  borderWidth: 1,
                  borderColor: tab === s ? statutColor[s] : colors.border,
                }}
                onPress={() => setTab(s)}
              >
                <Text style={{ color: tab === s ? '#fff' : colors.text, fontWeight: 'bold' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flex: 1, width: '100%' }}>
            <Text style={[styles.title, { color: colors.primary }]}>Réservations {tab === 'en attente' ? 'en attente' : 'confirmées'}</Text>
            {/* Liste filtrée (à brancher sur les vraies réservations quand dispo) */}
            {/* <FlatList ... /> */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openModal}>
              <MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <AddReservationsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSave={handleSave}
            form={form}
            setForm={setForm}
            biens={biens}
            colors={colors}
          />
        </>
      )}
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
