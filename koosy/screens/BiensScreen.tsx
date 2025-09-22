import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, Modal, Dimensions, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Bien } from '../models/models';
import { apiFetch } from '../utils/api';
const SCREEN_WIDTH = Dimensions.get('window').width;

// Les biens seront récupérés dynamiquement depuis le backend

const BiensScreen: React.FC = () => {
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
  useEffect(() => {
    const fetchBiens = async () => {
      try {
        const biensData = await apiFetch('/biens');
        // Adaptation des images si besoin (remplacer par assets locaux si pas d'URL)
        const biensAdapted = biensData.map((bien: any) => ({
          ...bien,
          photos: bien.images && bien.images.length > 0
            ? bien.images.map((img: any) => ({ uri: img.url }))
            : [require('../assets/house.jpg')], // fallback image
          proprio: {
            id: bien.conciergerie?.id?.toString() || '',
            nom: bien.proprietaireNom || '',
            email: bien.proprietaireEmail || '',
            telephone: bien.proprietaireTelephone || '',
          },
          geo: { lat: bien.lat, lng: bien.lng },
          locataires: bien.reservations?.map((r: any) => ({
            id: r.locataire?.id?.toString() || '',
            nom: r.locataire?.nom || '',
            email: r.locataire?.email || '',
            telephone: r.locataire?.telephone || '',
            dateArrivee: r.dateArrivee,
            dateDepart: r.dateDepart,
            bienId: bien.id?.toString() || '',
          })) || [],
          taches: bien.taches?.map((t: any) => ({
            id: t.id?.toString() || '',
            titre: t.titre,
            description: t.description,
            statut: t.statut,
            bienId: bien.id?.toString() || '',
            dateEcheance: t.dateEcheance,
          })) || [],
          historique: [],
          commentaires: [],
          dateCreation: bien.dateCreation,
        }));
        setBiens(biensAdapted);
      } catch (err) {
        console.error('Erreur récupération biens:', err);
      }
    };
    fetchBiens();
  }, []);
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  // carouselIndex inutilisé, supprimé

  // Actions principales
  const handleAjouterBien = () => alert('Ajouter un bien (à implémenter)');
  const handleModifierBien = (bien: Bien) => alert(`Modifier le bien : ${bien.nom}`);
  const handleSupprimerBien = (bienId: string) => setBiens(biens.filter(b => b.id !== bienId));
  const handleVoirMap = (bien: Bien) => alert(`Voir la carte pour : ${bien.nom}`);
  const handlePhotoPress = (photo: any) => { setSelectedPhoto(photo); setModalVisible(true); };

  // Carrousel photos
  const renderCarousel = (photos: any[]) => (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {photos.map((photo, idx) => (
        <TouchableOpacity key={idx} onPress={() => handlePhotoPress(photo)}>
          <Image source={photo} style={styles.carouselPhoto} resizeMode="cover" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header sticky */}
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Mes biens</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAjouterBien}>
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
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>{item.nom}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
              Créé le {item.dateCreation ? formatDateFR(item.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
            </Text>
            {item.photos && item.photos.length > 0 && renderCarousel(item.photos)}
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text><Text style={[styles.infoValue, { color: colors.text }]}>{item.type}</Text></View>
              <View style={styles.infoCol}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Superficie</Text><Text style={[styles.infoValue, { color: colors.text }]}>{item.superficie} m²</Text></View>
              <View style={styles.infoCol}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pièces</Text><Text style={[styles.infoValue, { color: colors.text }]}>{item.pieces}</Text></View>
              <View style={styles.infoCol}><Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Statut</Text><Text style={[styles.infoValue, { color: colors.accent }]}>{item.statut}</Text></View>
            </View>
            {/* Propriétaire */}
            <View style={styles.proprioBox}>
              <View style={styles.avatarCircle}>
                <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.proprio.nom}</Text>
                <Text style={{ color: colors.textSecondary }}>{item.proprio.email}</Text>
                <Text style={{ color: colors.textSecondary }}>{item.proprio.telephone}</Text>
              </View>
            </View>
            {/* Locataires */}
            <View style={styles.sectionRow}>
              <FontAwesome5 name="user-friends" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Locataires :</Text>
              <View style={styles.chipsRow}>
                {item.locataires.length > 0 ? item.locataires.map(loc => (
                  <View key={loc.id} style={[styles.chip, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
                    <FontAwesome5 name="user" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <View>
                      <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 13 }}>{loc.nom}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatDateFR(loc.dateArrivee)} → {formatDateFR(loc.dateDepart)}</Text>
                    </View>
                  </View>
                )) : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucun locataire</Text>}
              </View>
            </View>
            {/* Tâches */}
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Tâches :</Text>
              <View style={styles.timeline}>
                {item.taches.length > 0 ? item.taches.map(tache => (
                  <View key={tache.id} style={styles.timelineItem}>
                    <MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'à faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre}</Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
                    </View>
                  </View>
                )) : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tâche</Text>}
              </View>
            </View>
            {/* Actions */}
            <View style={styles.floatingActions}>
              <TouchableOpacity style={[styles.fab, { backgroundColor: colors.secondary }]} onPress={() => handleModifierBien(item)}>
                <MaterialCommunityIcons name="pencil" size={20} color={colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.fab, { backgroundColor: colors.error }]} onPress={() => handleSupprimerBien(item.id)}>
                <MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.fab, { backgroundColor: colors.accent }]} onPress={() => handleVoirMap(item)}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* Modale photo */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Fermer */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
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



