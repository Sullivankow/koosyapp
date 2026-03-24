import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../../screens/Layout/BienScreen.styles';

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
  onChangeTacheStatus?: (tacheId: string | number, statut: string) => void;
}


import { updateProprietaire } from '../../utils/api';

const BienCard: React.FC<BienCardProps> = ({ bien, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR, onChangeTacheStatus }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProprio, setIsEditingProprio] = useState(false);
  const [editValues, setEditValues] = useState({
    nom: bien.nom || '',
    adresse: bien.adresse || '',
    type: bien.type || '',
    superficie: bien.superficie ? String(bien.superficie) : '',
    pieces: bien.pieces ? String(bien.pieces) : '',
    equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
  });
  const [editProprio, setEditProprio] = useState({
    nom: bien.proprio?.nom || '',
    email: bien.proprio?.email || '',
    telephone: bien.proprio?.telephone || '',
  });
  const [loadingProprio, setLoadingProprio] = useState(false);


  const handleChange = (field: string, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };
  const handleChangeProprio = (field: string, value: string) => {
    setEditProprio(prev => ({ ...prev, [field]: value }));
  };


  const handleEditPress = () => {
    if (isEditing) {
      // Prépare le payload selon le DTO backend
      const payload: any = {
        nom: editValues.nom,
        adresse: editValues.adresse,
        type: editValues.type,
        superficie: Number(editValues.superficie),
        pieces: Number(editValues.pieces),
        equipements: editValues.equipements.split(',').map((e: string) => e.trim()).filter(Boolean),
      };
      if (bien.statut) payload.statut = bien.statut;
      if (bien.lat) payload.lat = bien.lat;
      if (bien.lng) payload.lng = bien.lng;
      onEdit({ id: bien.id, ...payload });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleEditProprioPress = () => {
    setEditProprio({
      nom: bien.proprio?.nom || '',
      email: bien.proprio?.email || '',
      telephone: bien.proprio?.telephone || '',
    });
    setIsEditingProprio(true);
  };

  const handleCancelEditProprio = () => {
    setEditProprio({
      nom: bien.proprio?.nom || '',
      email: bien.proprio?.email || '',
      telephone: bien.proprio?.telephone || '',
    });
    setIsEditingProprio(false);
  };

  const handleSaveProprio = async () => {
    if (!bien.proprietaire?.id && !bien.proprio?.id) return;
    setLoadingProprio(true);
    try {
      const id = bien.proprietaire?.id || bien.proprio?.id;
      await updateProprietaire(id, editProprio);
      setIsEditingProprio(false);
      if (typeof onEdit === 'function') {
        onEdit({ ...bien });
      }
    } catch (e: any) {
      alert('Erreur lors de la mise à jour du propriétaire : ' + (e?.message || e));
      console.error('Erreur updateProprietaire', e);
    } finally {
      setLoadingProprio(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValues({
      nom: bien.nom || '',
      adresse: bien.adresse || '',
      type: bien.type || '',
      superficie: bien.superficie ? String(bien.superficie) : '',
      pieces: bien.pieces ? String(bien.pieces) : '',
      equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
    });
    setIsEditing(false);
  };
  // Carrousel responsive avec largeur dynamique
  const { Dimensions } = require('react-native');
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const renderCarousel = (photos: any[]) => (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
      {photos.map((photo, idx) => {
        let source = photo;
        let key = (photo && photo.uri) ? photo.uri : `photo-${idx}`;
        if (photo && photo.uri !== undefined && (!photo.uri || photo.uri.trim() === '')) {
          source = require('../../assets/house.jpg');
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
      {isEditing ? (
        <TextInput
          style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }}
          value={editValues.nom}
          onChangeText={v => handleChange('nom', v)}
          placeholder="Nom du bien"
        />
      ) : (
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>{bien.nom || 'Sans nom'}</Text>
      )}
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
        Créé le {bien.dateCreation ? formatDateFR(bien.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
      </Text>
      {Array.isArray(bien.photos) && bien.photos.length > 0 && renderCarousel(bien.photos)}
      {/* Infos principales */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
              value={editValues.type}
              onChangeText={v => handleChange('type', v)}
              placeholder="Type"
            />
          ) : (
            <Text style={[styles.infoValue, { color: colors.text }]}>{bien.type || '-'}</Text>
          )}
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Superficie</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
              value={editValues.superficie}
              onChangeText={v => handleChange('superficie', v)}
              placeholder="Superficie (m²)"
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.infoValue, { color: colors.text }]}>{bien.superficie ? bien.superficie + ' m²' : '-'}</Text>
          )}
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pièces</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
              value={editValues.pieces}
              onChangeText={v => handleChange('pieces', v)}
              placeholder="Nb pièces"
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.infoValue, { color: colors.text }]}>{bien.pieces || '-'}</Text>
          )}
        </View>
        <View style={styles.infoCol}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Statut</Text>
          <TouchableOpacity onPress={() => onStatus(bien)} disabled={isEditing}>
            <Text style={[styles.infoValue, { color: bien.statut === 'disponible' ? 'green' : bien.statut === 'occupé' ? 'red' : colors.accent }]}>{bien.statut || '-'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Adresse et équipements */}
      <View style={{ marginTop: 8 }}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Adresse</Text>
        {isEditing ? (
          <TextInput
            style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
            value={editValues.adresse}
            onChangeText={v => handleChange('adresse', v)}
            placeholder="Adresse"
          />
        ) : (
          <Text style={[styles.infoValue, { color: colors.text }]}>{bien.adresse || '-'}</Text>
        )}
        <Text style={[styles.infoLabel, { color: colors.textSecondary, marginTop: 4 }]}>Équipements</Text>
        {isEditing ? (
          <TextInput
            style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
            value={editValues.equipements}
            onChangeText={v => handleChange('equipements', v)}
            placeholder="Équipements (séparés par des virgules)"
          />
        ) : (
          <Text style={[styles.infoValue, { color: colors.text }]}>{Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-')}</Text>
        )}
      </View>

      {/* Propriétaire - édition séparée */}
      <View style={styles.proprioBox}>
        <View style={styles.avatarCircle}>
          <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
        </View>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {isEditingProprio ? (
            <View style={{ flex: 1 }}>
              <TextInput
                style={{ color: colors.text, fontWeight: 'bold', borderBottomWidth: 1, borderColor: colors.primary, marginBottom: 2, backgroundColor: colors.surface }}
                value={editProprio.nom}
                onChangeText={v => handleChangeProprio('nom', v)}
                placeholder="Nom du propriétaire"
              />
              <TextInput
                style={{ color: colors.textSecondary, borderBottomWidth: 1, borderColor: colors.primary, marginBottom: 2, backgroundColor: colors.surface }}
                value={editProprio.email}
                onChangeText={v => handleChangeProprio('email', v)}
                placeholder="Email du propriétaire"
                keyboardType="email-address"
              />
              <TextInput
                style={{ color: colors.textSecondary, borderBottomWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface }}
                value={editProprio.telephone}
                onChangeText={v => handleChangeProprio('telephone', v)}
                placeholder="Téléphone du propriétaire"
                keyboardType="phone-pad"
              />
              <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                <TouchableOpacity onPress={handleSaveProprio} style={{ marginRight: 12, backgroundColor: colors.primary, padding: 6, borderRadius: 8 }} disabled={loadingProprio}>
                  <MaterialCommunityIcons name="content-save" size={18} color={colors.surface} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelEditProprio} style={{ backgroundColor: colors.error, padding: 6, borderRadius: 8, marginRight: 12 }} disabled={loadingProprio}>
                  <MaterialCommunityIcons name="close" size={18} color={colors.surface} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>{bien.proprio?.nom || 'N/A'}</Text>
                <Text style={{ color: colors.textSecondary }}>{bien.proprio?.email || ''}</Text>
                <Text style={{ color: colors.textSecondary }}>{bien.proprio?.telephone || ''}</Text>
              </View>
              <TouchableOpacity onPress={handleEditProprioPress} style={{ marginLeft: 8 }}>
                <MaterialCommunityIcons name="pencil" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
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
      {/* Prestations */}
      <View style={styles.sectionRow}>
        <MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
        <View style={styles.timeline}>
          {Array.isArray(bien.prestations) && bien.prestations.length > 0 ? bien.prestations.map((prestation: any) => (
            <View key={prestation.id} style={styles.timelineItem}>
              <MaterialCommunityIcons name="circle" size={10} color={prestation.status === 'terminée' ? colors.accent : colors.error} style={{ marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '500' }}>{prestation.description || 'N/A'}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {prestation.status} {prestation.date_prestation ? `- ${formatDateFR(prestation.date_prestation)}` : ''}
                  {typeof prestation.amount_cents === 'number' && prestation.amount_cents > 0 ? ` - ${(prestation.amount_cents / 100).toFixed(2)} €` : ''}
                </Text>
              </View>
            </View>
          )) : <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune prestation</Text>}
        </View>
      </View>
      {/* Actions principales */}
      <View style={styles.floatingActions}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: isEditing ? colors.primary : colors.secondary }]} onPress={handleEditPress}>
          <MaterialCommunityIcons name={isEditing ? "content-save" : "pencil"} size={20} color={colors.surface} />
        </TouchableOpacity>
        {isEditing ? (
          <TouchableOpacity style={[styles.fab, { backgroundColor: colors.error }]} onPress={handleCancelEdit}>
            <MaterialCommunityIcons name="close" size={20} color={colors.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.error }]}
            onPress={() => {
              Alert.alert(
                'Confirmation',
                'Êtes-vous sûr de vouloir supprimer ce bien ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(bien.id) },
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default BienCard;
