import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, Modal, Dimensions, TextInput } from 'react-native';
import StatusModal from '../components/StatusModal';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Bien } from '../models/models';
import { getBiens, updateBien, deleteBien } from '../utils/api';
import AddBienModal from '../components/AddBienModal';
const SCREEN_WIDTH = Dimensions.get('window').width;
import { getImageUrl } from '../utils/api';
import { useBienCount } from '../contexts/BienCountContext';
import { useTache } from '../contexts/TacheContext';

// Les biens seront récupérés dynamiquement depuis le backend

const BiensScreen: React.FC = () => {
  const { lastBienAdded, signalBienAdded } = useBienCount();
  const { lastTacheAdded } = useTache();
  const [statutModalVisible, setStatutModalVisible] = useState(false);
  // Formatage date française
  const formatDateFR = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || '';
    return d.toLocaleDateString('fr-FR');
  };



  const { colors } = useTheme();
  const [biens, setBiens] = useState<Bien[]>([]);



  // Récupération des biens depuis le backend
  const fetchBiens = async () => {
    try {
      const biensData = await getBiens();
      // Mapping et sécurisation des données
      const mappedBiens = biensData.map((bien: any) => {
        // Filtrage et mapping des images
        let photos = [];
        if (bien.images && bien.images.length > 0) {
          photos = bien.images
            .map((img: any) => {
              const uri = img.url ? getImageUrl(img.url.replace(/\\|\//g, '/')) : '';
              return uri && uri.trim() !== '' ? { uri } : null;
            })
            .filter((img: any) => img && img.uri && img.uri.trim() !== '');
        }
        // Log pour tous les biens
        console.log('PHOTOS bien', bien.nom, photos);
        if (photos.length === 0) {
          photos = [require('../assets/house.jpg')];
        }
        return {
          ...bien,
          photos,
          proprio: {
            nom: bien.proprietaireNom || 'N/A',
            email: bien.proprietaireEmail || '',
            telephone: bien.proprietaireTelephone || '',
          },
          locataires: Array.isArray(bien.locataires)
            ? bien.locataires.map((loc: any) => ({
                id: loc.id?.toString() || '',
                nom: loc.nom || 'N/A',
                dateArrivee: loc.dateArrivee || '',
                dateDepart: loc.dateDepart || '',
              }))
            : [],
          taches: Array.isArray(bien.taches)
            ? bien.taches.map((tache: any) => ({
                id: tache.id?.toString() || '',
                titre: tache.titre || 'N/A',
                statut: tache.statut || '',
                dateEcheance: tache.dateEcheance || '',
              }))
            : [],
        };
      });
      setBiens(mappedBiens);
    } catch (err) {
      console.error('Erreur récupération biens:', err);
    }
  };

  useEffect(() => {
    fetchBiens();
  }, [lastBienAdded, lastTacheAdded]);




  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const filteredBiens = biens.filter(b =>
    b.nom.toLowerCase().includes(search.toLowerCase()) ||
    b.adresse.toLowerCase().includes(search.toLowerCase())
  );




  const sortedBiens = [...filteredBiens].sort((a, b) => {
    const dateA = new Date(a.dateCreation || new Date()).getTime();
    const dateB = new Date(b.dateCreation || new Date()).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });




  // Séparation des états modaux
  const [addBienModalVisible, setAddBienModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  // carouselIndex inutilisé, supprimé




  
  // Actions principales
  const handleAjouterBien = () => alert('Ajouter un bien (à implémenter)');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleEditBien = (bien: Bien) => {
    setEditingId(bien.id);
    setEditForm({
      nom: bien.nom,
      adresse: bien.adresse,
      type: bien.type,
      superficie: bien.superficie?.toString() || '',
      pieces: bien.pieces?.toString() || '',
      proprietaireNom: bien.proprio?.nom || '',
      proprietaireEmail: bien.proprio?.email || '',
      proprietaireTelephone: bien.proprio?.telephone || '',
      equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : '',
      statut: bien.statut || '',
    });
  };

  const handleValidateEdit = async (bienId: string) => {
    try {
      const data = {
        ...editForm,
        superficie: Number(editForm.superficie),
        pieces: Number(editForm.pieces),
        equipements: editForm.equipements ? editForm.equipements.split(',').map((e: string) => e.trim()) : [],
      };
      await updateBien(bienId, data);
      setEditingId(null);
      setEditForm({});
      await fetchBiens();
    } catch (err) {
      console.error('Erreur modification bien:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  const [successMsg, setSuccessMsg] = useState('');
  const handleSupprimerBien = async (bienId: string) => {
    try {
      await deleteBien(bienId);
      setSuccessMsg('Bien supprimé avec succès !');
      await fetchBiens();
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      console.error('Erreur suppression bien:', err);
    }
  };
  const handleVoirMap = (bien: Bien) => alert(`Voir la carte pour : ${bien.nom}`);
  const handlePhotoPress = (photo: any) => { setSelectedPhoto(photo); setPhotoModalVisible(true); };

  // Carrousel photos
  const renderCarousel = (photos: any[]) => (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {photos.map((photo, idx) => {
        // Fallback si URI vide
        let source = photo;
        let key = (photo && photo.uri) ? photo.uri : `photo-${idx}`;
        if (photo && photo.uri !== undefined && (!photo.uri || photo.uri.trim() === '')) {
          source = require('../assets/house.jpg');
          key = `default-photo-${idx}`;
        }
        return (
          <TouchableOpacity key={key} onPress={() => handlePhotoPress(source)}>
            <Image source={source} style={styles.carouselPhoto} resizeMode="cover" />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {successMsg ? (
        <View style={{ backgroundColor: '#43a047', padding: 10, borderRadius: 8, margin: 10 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>{successMsg}</Text>
        </View>
      ) : null}
      <AddBienModal
        visible={addBienModalVisible}
        onClose={() => setAddBienModalVisible(false)}
        onSuccess={() => { fetchBiens(); signalBienAdded(); }}
      />
      {/* Header sticky */}
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Mes biens</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setAddBienModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>
      {/* Barre de recherche + icône de tri alignées */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text
          }}
          placeholder="Rechercher un bien..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
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
      <FlatList
        data={sortedBiens}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}> 
            {/* Nom du bien */}
            {editingId === item.id ? (
              <TextInput
                style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 6 }}
                value={editForm.nom}
                onChangeText={v => setEditForm((prev: any) => ({ ...prev, nom: v }))}
              />
            ) : (
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>{item.nom || 'Sans nom'}</Text>
            )}
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
              Créé le {item.dateCreation ? formatDateFR(item.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
            </Text>
            {Array.isArray(item.photos) && item.photos.length > 0 && renderCarousel(item.photos)}
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
                {editingId === item.id ? (
                  <TextInput
                    style={{ fontSize: 15, fontWeight: 'bold', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4, color: '#222' }}
                    value={editForm.type}
                    onChangeText={v => setEditForm((prev: any) => ({ ...prev, type: v }))}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.type || '-'}</Text>
                )}
              </View>
              <View style={styles.infoCol}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Superficie</Text>
                {editingId === item.id ? (
                  <TextInput
                    style={{ fontSize: 15, fontWeight: 'bold', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4, color: '#222' }}
                    value={editForm.superficie}
                    onChangeText={v => setEditForm((prev: any) => ({ ...prev, superficie: v }))}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.superficie ? item.superficie + ' m²' : '-'}</Text>
                )}
              </View>
              <View style={styles.infoCol}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pièces</Text>
                {editingId === item.id ? (
                  <TextInput
                    style={{ fontSize: 15, fontWeight: 'bold', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4, color: '#222' }}
                    value={editForm.pieces}
                    onChangeText={v => setEditForm((prev: any) => ({ ...prev, pieces: v }))}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{item.pieces || '-'}</Text>
                )}
              </View>
              <View style={styles.infoCol}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Statut</Text>
                {editingId === item.id ? (
                  <>
                    <TouchableOpacity
                      style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 8 }}
                      onPress={() => setStatutModalVisible(true)}
                    >
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#222' }}>
                        {editForm.statut ? editForm.statut.charAt(0).toUpperCase() + editForm.statut.slice(1) : 'Choisir le statut'}
                      </Text>
                    </TouchableOpacity>
                    <StatusModal
                      visible={statutModalVisible}
                      onClose={() => setStatutModalVisible(false)}
                      onSelect={status => setEditForm((prev: any) => ({ ...prev, statut: status }))}
                      currentStatus={editForm.statut}
                    />
                  </>
                ) : (
                  <Text style={[styles.infoValue, { color: colors.accent }]}>{item.statut || '-'}</Text>
                )}
              </View>
            </View>
            {/* Propriétaire */}
            <View style={styles.proprioBox}>
              <View style={styles.avatarCircle}>
                <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                {editingId === item.id ? (
                  <>
                    <TextInput style={{ color: '#222', fontWeight: 'bold', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4, marginBottom: 2 }} value={editForm.proprietaireNom} onChangeText={v => setEditForm((prev: any) => ({ ...prev, proprietaireNom: v }))} />
                    <TextInput style={{ color: '#222', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4, marginBottom: 2 }} value={editForm.proprietaireEmail} onChangeText={v => setEditForm((prev: any) => ({ ...prev, proprietaireEmail: v }))} keyboardType="email-address" />
                    <TextInput style={{ color: '#222', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 4 }} value={editForm.proprietaireTelephone} onChangeText={v => setEditForm((prev: any) => ({ ...prev, proprietaireTelephone: v }))} keyboardType="phone-pad" />
                  </>
                ) : (
                  <>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.proprio?.nom || 'N/A'}</Text>
                    <Text style={{ color: colors.textSecondary }}>{item.proprio?.email || ''}</Text>
                    <Text style={{ color: colors.textSecondary }}>{item.proprio?.telephone || ''}</Text>
                  </>
                )}
              </View>
            </View>

            {/* Réservations */}
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Réservations :</Text>
            </View>
            {/* Liste verticale des réservations, sous le titre */}
            <View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {Array.isArray(item.reservations) && item.reservations.length > 0 ? item.reservations.map((resa: any) => (
                <View key={resa.id} style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.accent + '22', borderColor: colors.accent, borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 2, maxWidth: '100%' }}>
                  <MaterialCommunityIcons name="account" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>{resa.locataire?.nom || ''} {resa.locataire?.prenom || ''}</Text>
                    {resa.locataire?.email ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.email}</Text>
                    ) : null}
                    {resa.locataire?.telephone ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.telephone}</Text>
                    ) : null}
                    <Text style={{ color: '#1976D2', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{formatDateFR(resa.dateDebut)} → {formatDateFR(resa.dateFin)}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.statut ? resa.statut.charAt(0).toUpperCase() + resa.statut.slice(1) : ''}</Text>
                  </View>
                </View>
              )) : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune réservation</Text>}
            </View>
            {/* Tâches */}
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Tâches :</Text>
              <View style={styles.timeline}>
                {Array.isArray(item.taches) && item.taches.length > 0 ? item.taches.map(tache => (
                  <View key={tache.id} style={styles.timelineItem}>
                    <MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'à faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre || 'N/A'}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
                    </View>
                  </View>
                )) : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tâche</Text>}
              </View>
            </View>
            {/* Actions */}
            <View style={styles.floatingActions}>
              {editingId === item.id ? (
                <>
                  <TouchableOpacity style={[styles.fab, { backgroundColor: colors.success }]} onPress={() => handleValidateEdit(item.id)}>
                    <MaterialCommunityIcons name="check" size={20} color={colors.surface} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.fab, { backgroundColor: colors.error }]} onPress={handleCancelEdit}>
                    <MaterialCommunityIcons name="close" size={20} color={colors.surface} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.fab, { backgroundColor: colors.secondary }]} onPress={() => handleEditBien(item)}>
                    <MaterialCommunityIcons name="pencil" size={20} color={colors.surface} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.fab, { backgroundColor: colors.error }]} onPress={() => handleSupprimerBien(item.id)}>
                    <MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.fab, { backgroundColor: colors.accent }]} onPress={() => handleVoirMap(item)}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={colors.surface} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      />
      {/* Modale photo */}
      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Fermer */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setPhotoModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {/* Image */}
          {selectedPhoto && (
            <Image source={selectedPhoto} style={styles.modalPhoto} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  headerSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    // position: 'sticky', // Non supporté RN
    // top: 0,
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
  card: {
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  carousel: {
    marginBottom: 12,
    borderRadius: 14,
    // overflow: 'hidden', // Non supporté sur ScrollView
  },
  carouselPhoto: {
    width: SCREEN_WIDTH - 32,
    height: 180,
    borderRadius: 14,
    marginRight: 4,
    // Pas de style View/Text ici
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 12,
  },
  infoCol: {
    width: '48%',
    marginBottom: 4,
  },
  infoLabel: {
    color: '#888',
    fontSize: 13,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  proprioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
    gap: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
    marginRight: 4,
    minWidth: 90,
    gap: 4,
  },
  timeline: {
    flex: 1,
    flexDirection: 'column',
    gap: 6,
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  floatingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 16,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPhoto: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
    // Pas de style View/Text ici
  },
  closeBtn: {
    position: 'absolute',
    top: 30,
    right: 30,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
});

export default BiensScreen;






