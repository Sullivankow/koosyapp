import React, { useState, useEffect, useRef } from 'react';

import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, Modal, Dimensions, TextInput } from 'react-native';
import BienCard from '../../components/BienCard';
import StatusModal from '../../components/StatusModal';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Bien } from '../../models/models';
import { getBiens, updateBien, deleteBien } from '../../utils/api';
import AddBienModal from '../../components/AddBienModal';
const SCREEN_WIDTH = Dimensions.get('window').width;
import { getImageUrl } from '../../utils/api';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTache } from '../../contexts/TacheContext';

// Les biens seront récupérés dynamiquement depuis le backend

import { useNavigation, useRoute } from '@react-navigation/native';

const BiensScreen: React.FC = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const focusBienId = route?.params?.focusBienId as string | undefined;
  const listRef = useRef<any>(null);
  const { lastBienAdded, signalBienAdded } = useBienCount();
  const { lastTacheAdded } = useTache();
  const [statutModalVisible, setStatutModalVisible] = useState(false);
  const [currentStatusBienId, setCurrentStatusBienId] = useState<string | null>(null);
  const [currentBienStatus, setCurrentBienStatus] = useState<string | undefined>(undefined);
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
  // photos processed for UI
        if (photos.length === 0) {
          photos = [require('../../assets/house.jpg')];
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
      // erreur lors de la récupération des biens
    }
  };

  useEffect(() => {
    fetchBiens();
  }, [lastBienAdded, lastTacheAdded]);

  // Si on arrive avec un param focusBienId, on scroll vers l'item correspondant
  useEffect(() => {
    if (focusBienId && biens && biens.length > 0 && listRef.current) {
      // Utiliser l'ordre affiché (sortedBiens) pour trouver l'index
      const index = sortedBiens.findIndex((b: any) => b.id === focusBienId);
      if (index >= 0) {
        // Scroll doucement vers l'index
        setTimeout(() => {
          try {
            listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
          } catch (err) {
            // unable to scroll to index; fallback handled silently
              try {
                const offset = CARD_HEIGHT * index;
                listRef.current.scrollToOffset({ offset, animated: true });
              } catch (err2) {
                // fallback failed silently
              }
          }
        }, 300);
      }
      // Nettoyer le param pour éviter scroll répété
      navigation.setParams({ focusBienId: undefined });
    }
  }, [focusBienId, biens]);




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

  // Hauteur approximative d'une carte pour getItemLayout (ajuster si nécessaire)
  const CARD_HEIGHT = 340;




  // Séparation des états modaux
  const [addBienModalVisible, setAddBienModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  // modal edit
  const [editModalData, setEditModalData] = useState<{ visible: boolean; bienId?: string; initialData?: any }>({ visible: false });




  
  // Actions principales
  const handleAjouterBien = () => setAddBienModalVisible(true);
  // edit modal flow
  const openEditModal = (bien: Bien) => {
    setEditModalData({ visible: true, bienId: bien.id, initialData: bien });
  };
  const closeEditModal = () => {
    setEditModalData({ visible: false });
  };

  const openStatusModal = (bien: Bien) => {
    setCurrentStatusBienId(bien.id);
    setCurrentBienStatus(bien.statut);
    setStatutModalVisible(true);
  };

  const handleSelectStatus = async (status: string) => {
    if (!currentStatusBienId) return;
    try {
      // Récupère le bien complet pour construire un payload conforme au DTO du backend
      const fullBien = await (await import('../../utils/api')).getBienById(currentStatusBienId);
      if (!fullBien) throw new Error('Bien introuvable');
      const payload = {
        proprietaireNom: fullBien.proprietaireNom || fullBien.proprio?.nom || '',
        proprietaireEmail: fullBien.proprietaireEmail || fullBien.proprio?.email || '',
        proprietaireTelephone: fullBien.proprietaireTelephone || fullBien.proprio?.telephone || '',
        nom: fullBien.nom || '',
        adresse: fullBien.adresse || '',
        type: fullBien.type || '',
        superficie: Number(fullBien.superficie) || 0,
        pieces: Number(fullBien.pieces) || 0,
        equipements: Array.isArray(fullBien.equipements) ? fullBien.equipements : (fullBien.equipements ? String(fullBien.equipements).split(',').map((s: string) => s.trim()) : []),
        photos: fullBien.photos || fullBien.images || [],
        statut: status,
        lat: fullBien.lat,
        lng: fullBien.lng,
      } as any;
      await updateBien(currentStatusBienId, payload);
      setSuccessMsg('Statut mis à jour');
      await fetchBiens();
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch (err) {
      // erreur lors de la mise à jour du statut
    } finally {
      setStatutModalVisible(false);
      setCurrentStatusBienId(null);
      setCurrentBienStatus(undefined);
    }
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
      // erreur suppression bien
    }
  };
  const handlePhotoPress = (photo: any) => { setSelectedPhoto(photo); setPhotoModalVisible(true); };

  // Carrousel photos
  const renderCarousel = (photos: any[]) => (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {photos.map((photo, idx) => {
        // Fallback si URI vide
        let source = photo;
        let key = (photo && photo.uri) ? photo.uri : `photo-${idx}`;
        if (photo && photo.uri !== undefined && (!photo.uri || photo.uri.trim() === '')) {
          source = require('../../assets/house.jpg');
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
      {/* ...existing code... (la carte a été supprimée) */}
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
      <StatusModal visible={statutModalVisible} onClose={() => setStatutModalVisible(false)} onSelect={handleSelectStatus} currentStatus={currentBienStatus} />
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
        ref={listRef}
        data={sortedBiens}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
        getItemLayout={(_, index) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index })}
        renderItem={({ item }) => (
          <BienCard
            bien={item}
            colors={colors}
            onEdit={openEditModal}
            onDelete={handleSupprimerBien}
            onStatus={openStatusModal}
            onPhotoPress={handlePhotoPress}
            formatDateFR={formatDateFR}
          />
        )}
      />
      {/* Edit modal using AddBienModal */}
      <AddBienModal
        visible={editModalData.visible}
        onClose={closeEditModal}
        mode="edit"
        bienId={editModalData.bienId}
        initialData={editModalData.initialData}
        onSuccess={async () => { await fetchBiens(); closeEditModal(); }}
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


import { styles } from './BienScreen.styles';

export default BiensScreen;






