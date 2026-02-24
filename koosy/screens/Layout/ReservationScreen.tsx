import React, { useState, useEffect } from 'react';
import { useBienCount } from '../../contexts/BienCountContext';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Reservation, Bien, Locataire } from '../../models/models';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBiens, createReservation, getReservations } from '../../utils/api';
import { useReservationRefresh } from '../../contexts/ReservationRefreshContext';
import dayjs from 'dayjs';
import AddReservationsModal from '../../components/AddReservationsModal';

const statutColor = {
  'confirmée': '#43A047',
  'en attente': '#FF7043',
  'annulée': '#B71C1C',
  'terminée': '#1976D2',
};

// Fonction utilitaire pour formatage date FR
function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('fr-FR');
}

function ReservationScreen() {
  const { colors } = useTheme();
  const { signalBienAdded } = useBienCount();
  const { lastReservationAdded } = useReservationRefresh();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [biens, setBiens] = useState<Bien[]>([]);
  // Pas de table locataires, on utilise uniquement les champs de la réservation
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<{ bienId: string; locataireNom: string; locatairePrenom: string; locataireEmail: string; locataireTelephone: string; dateArrivee: string; dateDepart: string; heureArrivee: string; heureDepart: string; statut: 'confirmée' | 'en attente' }>(
    { bienId: '', locataireNom: '', locatairePrenom: '', locataireEmail: '', locataireTelephone: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' }
  );
  const [editId, setEditId] = useState<string | null>(null);
  const [tab, setTab] = useState<'en attente' | 'confirmée'>('en attente');

  // Fonction pour charger les biens et réservations
  const fetchData = async () => {
    setLoading(true);
    try {
      const biensData = await getBiens();
      setBiens(biensData);
      const reservationsData = await getReservations();
      setReservations(reservationsData);
      // TODO: Remplacer par getLocataires() quand dispo
      // setLocataires(await getLocataires());
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lastReservationAdded]);

  // Ajout réel via API
  const handleSave = async () => {
    if (!form.bienId || !form.locataireNom || !form.locatairePrenom || !form.locataireEmail || !form.dateArrivee || !form.dateDepart) {
      Alert.alert('Champs manquants', 'Merci de remplir tous les champs obligatoires.');
      return;
    }
    try {
      // Conversion ISO -> JJ/MM/AAAA pour le backend
      const formatToFR = (iso: string) => {
        if (/^(\d{4})-(\d{2})-(\d{2})$/.test(iso)) {
          return dayjs(iso).format('DD/MM/YYYY');
        }
        return iso;
      };
      await createReservation({
        bienId: Number(form.bienId),
        locataireNom: form.locataireNom,
        locatairePrenom: form.locatairePrenom,
        locataireEmail: form.locataireEmail,
        locataireTelephone: form.locataireTelephone,
        dateDebut: formatToFR(form.dateArrivee),
        dateFin: formatToFR(form.dateDepart),
        statut: form.statut,
      });
      setModalVisible(false);
      setForm({ bienId: '', locataireNom: '', locatairePrenom: '', locataireEmail: '', locataireTelephone: '', dateArrivee: '', dateDepart: '', heureArrivee: '', heureDepart: '', statut: 'en attente' });
      fetchData();
      signalBienAdded();
      // Signale le rafraîchissement global
      import('../../contexts/ReservationRefreshContext').then(ctx => ctx.useReservationRefresh().signalReservationAdded());
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
      {/* Titre principal */}
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 32, marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 }}>
        Mes réservations
      </Text>
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
          <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
            <Text style={[styles.title, { color: colors.primary }]}>Réservations {tab === 'en attente' ? 'en attente' : 'confirmées'}</Text>
            {/* Liste filtrée */}
            {reservations.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 24 }}>Aucune réservation</Text>
            ) : (
              <>
                {reservations.filter((r: Reservation) => r.statut === tab).length === 0 ? (
                  <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 24 }}>Aucune réservation {tab}</Text>
                ) : (
                  <>
                    {reservations.filter((r: Reservation) => r.statut === tab).map((r: Reservation) => {
                      // Utilisation des champs imbriqués renvoyés par l'API (relations TypeORM)
                      const bienNom = r.bien?.nom || 'Bien inconnu';
                      const locNom = r.locataire?.nom || '';
                      const locPrenom = r.locataire?.prenom || '';
                      const locEmail = r.locataire?.email || '';
                      const locTel = r.locataire?.telephone || '';
                      // Dates (backend: dateDebut/dateFin)
                      const dateDebut = r.dateDebut || r.dateArrivee || '';
                      const dateFin = r.dateFin || r.dateDepart || '';
                      return (
                        <View key={r.id} style={[styles.card, { borderLeftColor: statutColor[r.statut] || colors.primary }]}> 
                          <Text style={styles.cardTitle}>{bienNom}</Text>
                          <Text style={{ color: '#111', fontWeight: 'bold', fontSize: 16 }}>
                            {locNom}{locPrenom ? ' ' + locPrenom : ''}
                          </Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                            {locEmail}
                          </Text>
                          {locTel ? (
                            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                              {locTel}
                            </Text>
                          ) : null}
                          {/* Dates sous le téléphone */}
                          <Text style={{ color: '#1976D2', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>
                            {formatDateFR(dateDebut)} → {formatDateFR(dateFin)}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                            <Text style={{
                              backgroundColor: statutColor[r.statut] || colors.primary,
                              color: '#fff',
                              borderRadius: 12,
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              fontWeight: 'bold',
                              fontSize: 13,
                              marginRight: 8
                            }}>{r.statut.charAt(0).toUpperCase() + r.statut.slice(1)}</Text>
                            {/* Badge vert pour confirmer la réservation si en attente */}
                            {r.statut === 'en attente' && (
                              <TouchableOpacity
                                style={{
                                  backgroundColor: '#43A047',
                                  borderRadius: 12,
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  marginLeft: 10,
                                }}
                                onPress={async () => {
                                  try {
                                    await import('../../utils/api').then(api => api.updateReservationStatut(r.id, 'confirmée'));
                                    fetchData();
                                    signalBienAdded();
                                  } catch (e: any) {
                                    const msg = e?.message || e?.toString() || 'Impossible de confirmer la réservation.';
                                    Alert.alert('Erreur', msg);
                                  }
                                }}
                              >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Confirmer</Text>
                              </TouchableOpacity>
                            )}
                            {/* Icône de suppression */}
                            <TouchableOpacity
                              style={{ marginLeft: 14, padding: 4 }}
                              onPress={async () => {
                                Alert.alert(
                                  'Supprimer',
                                  'Voulez-vous vraiment supprimer cette réservation ?',
                                  [
                                    { text: 'Annuler', style: 'cancel' },
                                    { text: 'Supprimer', style: 'destructive', onPress: async () => {
                                        try {
                                          await import('../../utils/api').then(api => api.deleteReservation(r.id));
                                          fetchData();
                                          signalBienAdded();
                                        } catch (e) {
                                          Alert.alert('Erreur', 'Impossible de supprimer la réservation.');
                                        }
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#B71C1C" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            )}
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openModal}>
              <MaterialCommunityIcons name="plus" size={28} color={colors.surface} />
            </TouchableOpacity>
          </ScrollView>
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

export default ReservationScreen;
