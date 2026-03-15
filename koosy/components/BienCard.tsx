import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../screens/Layout/BienScreen.styles';

/**
 * Composant Carte de Bien
 * Affiche toutes les informations d'un bien immobilier, ses photos, propriétaire, réservations et tâches.
 */

// Interface des props du composant BienCard
interface BienCardProps {
  bien: any; // Remplace 'any' par le type Bien si tu l'as importé
  colors: any;
  onEdit: (bien: any) => void;
  onDelete: (bienId: string) => void;
  onStatus: (bien: any) => void;
  onPhotoPress: (photo: any) => void;
  formatDateFR: (dateStr?: string) => string;
}

const BienCard: React.FC<BienCardProps> = ({ bien, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR }) => {
  // Carrousel responsive avec largeur dynamique
  const { Dimensions } = require('react-native');
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const renderCarousel = (photos: any[]) => (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {photos.map((photo, idx) => {
        let source = photo;
        let key = (photo && photo.uri) ? photo.uri : `photo-${idx}`;
        if (photo && photo.uri !== undefined && (!photo.uri || photo.uri.trim() === '')) {
          source = require('../assets/house.jpg');
          key = `default-photo-${idx}`;
        }
        return (
          <TouchableOpacity key={key} onPress={() => onPhotoPress(source)}>
            <Image source={source} style={[styles.carouselPhoto, { width: SCREEN_WIDTH - 32 }]} resizeMode="cover" />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}> 
      {/* Nom du bien */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>{bien.nom || 'Sans nom'}</Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
        Créé le {bien.dateCreation ? formatDateFR(bien.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
      </Text>
      {Array.isArray(bien.photos) && bien.photos.length > 0 && renderCarousel(bien.photos)}
      {/* Infos principales */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{bien.type || '-'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Superficie</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{bien.superficie ? bien.superficie + ' m²' : '-'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pièces</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{bien.pieces || '-'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Statut</Text>
          <TouchableOpacity onPress={() => onStatus(bien)}>
            <Text style={[styles.infoValue, { color: bien.statut === 'disponible' ? 'green' : bien.statut === 'occupé' ? 'red' : colors.accent }]}>{bien.statut || '-'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Propriétaire */}
      <View style={styles.proprioBox}>
        <View style={styles.avatarCircle}>
          <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{bien.proprio?.nom || 'N/A'}</Text>
          <Text style={{ color: colors.textSecondary }}>{bien.proprio?.email || ''}</Text>
          <Text style={{ color: colors.textSecondary }}>{bien.proprio?.telephone || ''}</Text>
        </View>
      </View>
      {/* Réservations */}
      <View style={styles.sectionRow}>
        <MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
        <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Réservations :</Text>
      </View>
      <View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {Array.isArray(bien.reservations) && bien.reservations.length > 0 ? bien.reservations.map((resa: any) => (
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
          {Array.isArray(bien.taches) && bien.taches.length > 0 ? bien.taches.map((tache: any) => (
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
      {/* Actions principales */}
      <View style={styles.floatingActions}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.secondary }]} onPress={() => onEdit(bien)}>
          <MaterialCommunityIcons name="pencil" size={20} color={colors.surface} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.error }]} onPress={() => onDelete(bien.id)}>
          <MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BienCard;
