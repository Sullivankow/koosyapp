import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Bien } from '../models/models';

// Mock de 4 biens avec plusieurs photos
const MOCK_BIENS: Bien[] = [
  {
    id: '1',
    nom: 'Appartement République',
    adresse: '12 rue de la Liberté, Paris',
    type: 'Appartement',
    superficie: 65,
    pieces: 3,
    equipements: ['Wifi', 'TV', 'Lave-linge'],
    photos: [
      require('../assets/house.jpg'),
      require('../assets/house2.jpg'),
      require('../assets/house3.jpg'),
    ],
    statut: 'occupé',
    geo: { lat: 48.867, lng: 2.363 },
    proprio: { id: 'p1', nom: 'Jean Dupont', email: 'jean@ex.fr', telephone: '0601020304' },
    locataires: [
      { id: 'l1', nom: 'Alice Martin', email: 'alice@loc.fr', telephone: '0600000001', dateArrivee: '2025-09-01', dateDepart: '2025-09-10' }
    ],
    taches: [
      { id: 't1', titre: 'Nettoyage', description: 'Nettoyer la salle de bain', statut: 'à faire', bienId: '1', dateEcheance: '2025-09-11' }
    ],
    historique: [],
    commentaires: [],
  },
  {
    id: '2',
    nom: 'Studio Opéra',
    adresse: '5 avenue de l’Opéra, Paris',
    type: 'Studio',
    superficie: 28,
    pieces: 1,
    equipements: ['Wifi', 'Micro-ondes'],
    photos: [
      require('../assets/house2.jpg'),
      require('../assets/house3.jpg'),
      require('../assets/house4.jpg'),
    ],
    statut: 'disponible',
    geo: { lat: 48.868, lng: 2.332 },
    proprio: { id: 'p2', nom: 'Marie Dubois', email: 'marie@ex.fr', telephone: '0601020305' },
    locataires: [],
    taches: [],
    historique: [],
    commentaires: [],
  },
  {
    id: '3',
    nom: 'Maison Montmartre',
    adresse: '22 rue Lepic, Paris',
    type: 'Maison',
    superficie: 120,
    pieces: 5,
    equipements: ['Jardin', 'Garage', 'Wifi'],
    photos: [
      require('../assets/house3.jpg'),
      require('../assets/house4.jpg'),
      require('../assets/house.jpg'),
    ],
    statut: 'travaux',
    geo: { lat: 48.886, lng: 2.338 },
    proprio: { id: 'p3', nom: 'Paul Morel', email: 'paul@ex.fr', telephone: '0601020306' },
    locataires: [],
    taches: [
      { id: 't2', titre: 'Réparation', description: 'Réparer la porte', statut: 'en cours', bienId: '3', dateEcheance: '2025-09-15' }
    ],
    historique: [],
    commentaires: [],
  },
  {
    id: '4',
    nom: 'Loft Bastille',
    adresse: '8 passage de la Main d’Or, Paris',
    type: 'Loft',
    superficie: 80,
    pieces: 2,
    equipements: ['Wifi', 'Cuisine équipée'],
    photos: [
      require('../assets/house4.jpg'),
      require('../assets/house.jpg'),
      require('../assets/house2.jpg'),
    ],
    statut: 'occupé',
    geo: { lat: 48.853, lng: 2.370 },
    proprio: { id: 'p4', nom: 'Lucie Bernard', email: 'lucie@ex.fr', telephone: '0601020307' },
    locataires: [
      { id: 'l2', nom: 'Tom Leroy', email: 'tom@loc.fr', telephone: '0600000002', dateArrivee: '2025-09-05', dateDepart: '2025-09-12' }
    ],
    taches: [
      { id: 't3', titre: 'Inventaire', description: 'Vérifier les équipements', statut: 'à faire', bienId: '4', dateEcheance: '2025-09-13' }
    ],
    historique: [],
    commentaires: [],
  },
];

const BiensScreen: React.FC = () => {
  const { colors } = useTheme();
  const [biens, setBiens] = useState<Bien[]>(MOCK_BIENS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  // Actions
  const handleAjouterBien = () => {
    alert('Ajouter un bien (à implémenter)');
  };
  const handleModifierBien = (bien: Bien) => {
    alert(`Modifier le bien : ${bien.nom}`);
  };
  const handleSupprimerBien = (bienId: string) => {
    setBiens(biens.filter(b => b.id !== bienId));
  };
  const handleVoirMap = (bien: Bien) => {
    alert(`Voir la carte pour : ${bien.nom}`);
  };
  const handlePhotoPress = (photo: any) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.primary }]}>Liste des biens</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAjouterBien}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.surface} />
          <Text style={[styles.addText, { color: colors.surface }]}>Ajouter</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={biens}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Photos du bien */}
            {item.photos && item.photos.length > 0 && (
              <View style={styles.photoContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {item.photos.map((photo, idx) => {
                    let source;
                    if (typeof photo === 'string') {
                      source = { uri: photo };
                    } else {
                      source = photo;
                    }
                    return (
                      <TouchableOpacity key={idx} style={styles.photoWrapper} onPress={() => handlePhotoPress(source)}>
                        <Image source={source} style={styles.photo} resizeMode="cover" />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.primary }]}>{item.nom}</Text>
              <TouchableOpacity onPress={() => handleVoirMap(item)}>
                <MaterialCommunityIcons name="map-marker" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardAddress, { color: colors.textSecondary }]}>{item.adresse}</Text>
            <Text style={{ color: colors.text }}>Type : {item.type} | {item.pieces} pièces | {item.superficie} m²</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 2 }}>Propriétaire : {item.proprio.nom} ({item.proprio.email})</Text>
            {/* Locataires actuels */}
            {item.locataires.length > 0 ? (
              <View style={styles.sectionRow}>
                <FontAwesome5 name="user-friends" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.text, fontWeight: 'bold' }}> :</Text>
                <View style={{ marginLeft: 8 }}>
                  {item.locataires.map(loc => (
                    <Text key={loc.id} style={{ color: colors.text }}>
                      {loc.nom} ({loc.email})
                      {' '}du {loc.dateArrivee} au {loc.dateDepart}
                    </Text>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucun locataire actuellement</Text>
            )}
            {/* Tâches à faire */}
            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}> :</Text>
              <View style={{ marginLeft: 8 }}>
                {item.taches.length > 0 ? item.taches.map(tache => (
                  <Text key={tache.id} style={{ color: colors.text }}>
                    {tache.titre} ({tache.statut}) {tache.dateEcheance ? `- échéance : ${tache.dateEcheance}` : ''}
                  </Text>
                )) : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tâche</Text>}
              </View>
            </View>
            {/* Actions modifier/supprimer */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]} onPress={() => handleModifierBien(item)}>
                <MaterialCommunityIcons name="pencil" size={18} color={colors.surface} />
                <Text style={[styles.actionText, { color: colors.surface }]}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.error }]} onPress={() => handleSupprimerBien(item.id)}>
                <MaterialCommunityIcons name="delete" size={18} color={colors.surface} />
                <Text style={[styles.actionText, { color: colors.surface }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {/* Modale d’agrandissement de photo */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Bouton de fermeture */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <MaterialCommunityIcons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {/* Image agrandie */}
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
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  photoContainer: {
    marginBottom: 8,
  },
  photoWrapper: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardAddress: {
    fontSize: 14,
    marginBottom: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
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
