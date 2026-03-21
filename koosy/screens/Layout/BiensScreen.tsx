import { updateTacheStatut } from '../../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import BienCard from '../../components/BienCard';
import StatusModal from '../../components/StatusModal';
import { useTheme } from '../../contexts/ThemeContext';

import { Bien } from '../../models/models';
import useBiens from '../../hooks/useBiens';
import useBiensSearchSort from '../../hooks/useBiensSearchSort';
import AddBienModal from '../../components/AddBienModal';
import SearchBar from '../../components/SearchBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuccesMessage from '../../components/SuccesMessage';
import { useBienCount } from '../../contexts/BienCountContext';
import { useTache } from '../../contexts/TacheContext';
import { useTacheCount } from '../../contexts/TacheCountContext';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './BienScreen.styles';

const BiensScreen: React.FC = () => {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const focusBienId = route?.params?.focusBienId as string | undefined;
  const listRef = useRef<any>(null);
  const { lastBienAdded, signalBienAdded } = useBienCount();
  const { lastTacheAdded } = useTache();
  const { tacheCount } = useTacheCount();
  const { prestationsTerminees } = usePrestationsCount();
  const [statutModalVisible, setStatutModalVisible] = useState(false);
  const [currentStatusBienId, setCurrentStatusBienId] = useState<string | null>(null);
  const [currentBienStatus, setCurrentBienStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [addBienModalVisible, setAddBienModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [editModalData, setEditModalData] = useState<{ visible: boolean; bienId?: string; initialData?: any }>({ visible: false });
  const [successMsg, setSuccessMsg] = useState('');
  const { colors } = useTheme();

  // Récupération des biens (ajout de tacheCount comme dépendance)
  const { biens, fetchBiens, updateBienById, deleteBienById } = useBiens([lastBienAdded, lastTacheAdded, tacheCount, prestationsTerminees]);

  // Handler pour changer le statut d'une tâche et rafraîchir les biens
  const handleChangeTacheStatus = async (tacheId: string | number, statut: string) => {
    try {
      await updateTacheStatut(tacheId, statut);
      await fetchBiens();
      setSuccessMsg('Statut de la tâche mis à jour');
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch (err) {
      setSuccessMsg("Erreur lors de la mise à jour du statut de la tâche");
      setTimeout(() => setSuccessMsg(''), 1800);
    }
  };

  // Recherche locale
  const filteredBiens = biens.filter(b =>
    b.nom.toLowerCase().includes(search.toLowerCase()) ||
    b.adresse.toLowerCase().includes(search.toLowerCase())
  );

  // Tri via hook personnalisé
  const { sortOrder, setSortOrder, sortedBiens } = useBiensSearchSort(filteredBiens);

  // Scroll vers un bien si focusBienId
  useEffect(() => {
    if (focusBienId && sortedBiens.length > 0 && listRef.current) {
      const index = sortedBiens.findIndex((b: any) => b.id === focusBienId);
      if (index >= 0) {
        setTimeout(() => {
          try {
            listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.4 });
          } catch (err) {
            try {
              const CARD_HEIGHT = 340;
              const offset = CARD_HEIGHT * index;
              listRef.current.scrollToOffset({ offset, animated: true });
            } catch {}
          }
        }, 300);
      }
      navigation.setParams({ focusBienId: undefined });
    }
  }, [focusBienId, sortedBiens]);

  // Formatage date française
  const formatDateFR = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || '';
    return d.toLocaleDateString('fr-FR');
  };

  // Gestion modales et callbacks
  const openEditModal = (bien: Bien) => setEditModalData({ visible: true, bienId: bien.id, initialData: bien });
  const closeEditModal = () => setEditModalData({ visible: false });
  const openStatusModal = (bien: Bien) => {
    setCurrentStatusBienId(bien.id);
    setCurrentBienStatus(bien.statut);
    setStatutModalVisible(true);
  };
  const handleSelectStatus = async (status: string) => {
    if (!currentStatusBienId) return;
    try {
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
      await updateBienById(currentStatusBienId, payload);
      setSuccessMsg('Statut mis à jour');
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 1800);
    } catch {}
    finally {
      setStatutModalVisible(false);
      setCurrentStatusBienId(null);
      setCurrentBienStatus(undefined);
    }
  };
  const handleSupprimerBien = async (bienId: string) => {
    try {
      await deleteBienById(bienId);
      setSuccessMsg('Bien supprimé avec succès !');
      signalBienAdded();
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch {}
  };
  const handlePhotoPress = (photo: any) => { setSelectedPhoto(photo); setPhotoModalVisible(true); };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <SuccesMessage message={successMsg} />
      <AddBienModal
        visible={addBienModalVisible}
        onClose={() => setAddBienModalVisible(false)}
        onSuccess={() => { fetchBiens(); signalBienAdded(); }}
      />
      <StatusModal visible={statutModalVisible} onClose={() => setStatutModalVisible(false)} onSelect={handleSelectStatus} currentStatus={currentBienStatus} />
      <View style={[styles.headerSticky, { backgroundColor: colors.surface }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Mes biens</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setAddBienModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un bien..."
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
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
        getItemLayout={(_, index) => ({ length: 340, offset: 340 * index, index })}
        renderItem={({ item }) => (
          <BienCard
            bien={item}
            colors={colors}
            onEdit={openEditModal}
            onDelete={handleSupprimerBien}
            onStatus={openStatusModal}
            onPhotoPress={handlePhotoPress}
            formatDateFR={formatDateFR}
            onChangeTacheStatus={handleChangeTacheStatus}
          />
        )}
      />
      <AddBienModal
        visible={editModalData.visible}
        onClose={closeEditModal}
        mode="edit"
        bienId={editModalData.bienId}
        initialData={editModalData.initialData}
        onSuccess={async () => { await fetchBiens(); closeEditModal(); }}
      />
      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setPhotoModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={selectedPhoto} style={styles.modalPhoto} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default BiensScreen;






