import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

import { styles } from '../../../screens/Layout/styles/BienScreen.styles';
import type { Bien } from '../../../models/models';
import { Carrousel } from '../../../ui/Carrousel';
import ButtonAction from '../../../ui/ButtonAction';

interface BienCardProps {
  bien: Bien & { photos?: (string | { uri: string })[] };
  totalPrestationPercu: number;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    success?: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow?: string;
  };
  onEdit: (bien: Bien) => void;
  onDelete: (bienId: string) => void;
  onStatus: (bien: Bien) => void;
  onPhotoPress: (photo: string) => void;
  formatDateFR: (dateStr?: string) => string;
}

// Evite de redessiner une carte si ses donnees utiles et ses callbacks n'ont pas change.
const shouldReRender = (prev: Readonly<BienCardProps>, next: Readonly<BienCardProps>) => {
  if (prev.bien !== next.bien) return false;
  if (prev.totalPrestationPercu !== next.totalPrestationPercu) return false;
  if (prev.onEdit !== next.onEdit) return false;
  if (prev.onDelete !== next.onDelete) return false;
  if (prev.onStatus !== next.onStatus) return false;
  if (prev.onPhotoPress !== next.onPhotoPress) return false;

  const pc = prev.colors;
  const nc = next.colors;
  return pc.background === nc.background &&
    pc.surface === nc.surface &&
    pc.primary === nc.primary &&
    pc.secondary === nc.secondary &&
    pc.accent === nc.accent &&
    pc.error === nc.error &&
    pc.success === nc.success &&
    pc.text === nc.text &&
    pc.textSecondary === nc.textSecondary &&
    pc.border === nc.border &&
    pc.shadow === nc.shadow;
};

const ReservationItem = React.memo(({ resa, colors, formatDateFR }: { resa: any; colors: BienCardProps['colors']; formatDateFR: (d?: string) => string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.accent + '22', borderColor: colors.accent, borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 2 }}>
    <MaterialCommunityIcons name="account" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>{resa.locataire?.nom || ''} {resa.locataire?.prenom || ''}</Text>
      {resa.locataire?.email ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.email}</Text> : null}
      {resa.locataire?.telephone ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.telephone}</Text> : null}
      <Text style={{ color: '#1976D2', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{formatDateFR(resa.dateDebut)} - {formatDateFR(resa.dateFin)}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.statut ? resa.statut.charAt(0).toUpperCase() + resa.statut.slice(1) : ''}</Text>
    </View>
  </View>
));

const TacheItem = React.memo(({ tache, colors, formatDateFR }: { tache: any; colors: BienCardProps['colors']; formatDateFR: (d?: string) => string }) => (
  <View style={styles.timelineItem}>
    <MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'a faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre || 'N/A'}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
    </View>
  </View>
));

const PrestationItem = React.memo(({ prestation, colors, formatDateFR }: { prestation: any; colors: BienCardProps['colors']; formatDateFR: (d?: string) => string }) => (
  <View style={styles.timelineItem}>
    <MaterialCommunityIcons name="circle" size={10} color={prestation.status === 'terminee' ? colors.accent : colors.error} style={{ marginRight: 6 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontWeight: '500' }}>{prestation.description || 'N/A'}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        {prestation.status} {prestation.date_prestation ? `- ${formatDateFR(prestation.date_prestation)}` : ''}
        {typeof prestation.amount_cents === 'number' && prestation.amount_cents > 0 ? ` - ${(prestation.amount_cents / 100).toFixed(2)} EUR` : ''}
      </Text>
    </View>
  </View>
));

function BienCard(props: BienCardProps) {
  const { bien, totalPrestationPercu, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editValues, setEditValues] = useState({
    nom: bien.nom || '',
    adresse: bien.adresse || '',
    type: bien.type || '',
    superficie: bien.superficie ? String(bien.superficie) : '',
    pieces: bien.pieces ? String(bien.pieces) : '',
    equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
  });

  // Les donnees relationnelles sont triees uniquement quand la liste des reservations change.
  const sortedReservations = useMemo(() => {
    if (!bien.reservations || bien.reservations.length === 0) return [];
    return [...bien.reservations].sort((a: any, b: any) => new Date(a.dateDebut ?? 0).getTime() - new Date(b.dateDebut ?? 0).getTime());
  }, [bien.reservations]);

  // Resume de la prochaine reservation affiche dans la carte compacte.
  const nextReservationLabel = useMemo(() => {
    const nextReservation = sortedReservations.find((resa: any) => new Date(resa.dateDebut ?? resa.dateArrivee ?? 0).getTime() >= Date.now()) || sortedReservations[0];
    if (!nextReservation) return 'Aucune arrivee planifiee';

    const date = nextReservation.dateDebut || nextReservation.dateArrivee || '';
    const time = nextReservation.heureArrivee ? ` - ${nextReservation.heureArrivee}` : '';
    const tenant = nextReservation.locataire?.nom ? ` - ${nextReservation.locataire.nom}` : '';
    return `${formatDateFR(date)}${time}${tenant}`;
  }, [formatDateFR, sortedReservations]);

  const photoCount = useMemo(() => {
    return Array.isArray(bien.photos) ? bien.photos.length : 0;
  }, [bien.photos]);

  const ownerInitials = useMemo(() => {
    const name = bien.proprio?.nom || 'N/A';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'P';
  }, [bien.proprio?.nom]);

  const statutColor = useMemo(() => {
    if (bien.statut === 'disponible') return '#15803D';
    if (bien.statut === 'occupé') return '#B91C1C';
    return colors.accent;
  }, [bien.statut, colors.accent]);

  const statutBg = useMemo(() => {
    if (bien.statut === 'disponible') return '#DCFCE7';
    if (bien.statut === 'occupé') return '#FEE2E2';
    return '#FEF3C7';
  }, [bien.statut]);

  const handleChange = (field: keyof typeof editValues, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  // Valide l'edition inline avec les champs attendus par le parent, ou active le mode edition.
  const handleEditPress = () => {
    if (isEditing) {
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
      onEdit({ id: bien.id, proprio: bien.proprio, ...payload } as Bien);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setExpanded(true);
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

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow || '#000' }]}>
      <View style={styles.propertyMedia}>
        <Carrousel
          photos={bien.photos}
          onPhotoPress={onPhotoPress}
          style={styles.carouselDense}
          photoStyle={styles.carouselPhotoDense}
        />
        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>{photoCount} photo{photoCount > 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.denseHeaderRow}>
          <View style={styles.denseHeaderLeft}>
            {isEditing ? (
              <TextInput
                style={{ fontSize: 18, fontWeight: '900', color: colors.primary, marginBottom: 2, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }}
                value={editValues.nom}
                onChangeText={(v) => handleChange('nom', v)}
                placeholder="Nom du bien"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text, marginBottom: 3 }} numberOfLines={1}>{bien.nom || 'Sans nom'}</Text>
            )}
            <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '700' }} numberOfLines={1}>{bien.adresse || '-'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onStatus(bien)}
            disabled={isEditing}
            style={[styles.statusPillInline, { backgroundColor: statutBg }]}
          >
            <Text style={{ fontSize: 11, fontWeight: '900', color: statutColor }}>{bien.statut || '-'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGridDense}>
          <View style={[styles.metricBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoValue, { color: colors.text, borderBottomWidth: 1, borderColor: colors.primary }]}
                value={editValues.type}
                onChangeText={(v) => handleChange('type', v)}
                placeholder="Type"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{bien.type || '-'}</Text>
            )}
          </View>
          <View style={[styles.metricBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Surface</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoValue, { color: colors.text, borderBottomWidth: 1, borderColor: colors.primary }]}
                value={editValues.superficie}
                onChangeText={(v) => handleChange('superficie', v)}
                placeholder="m2"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{bien.superficie ? `${bien.superficie} m2` : '-'}</Text>
            )}
          </View>
          <View style={[styles.metricBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pieces</Text>
            {isEditing ? (
              <TextInput
                style={[styles.infoValue, { color: colors.text, borderBottomWidth: 1, borderColor: colors.primary }]}
                value={editValues.pieces}
                onChangeText={(v) => handleChange('pieces', v)}
                placeholder="Nb"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            ) : (
              <Text style={[styles.infoValue, { color: colors.text }]}>{bien.pieces || '-'}</Text>
            )}
          </View>
        </View>

        {isEditing ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Adresse</Text>
            <TextInput
              style={[styles.infoValue, { color: colors.text, borderBottomWidth: 1, borderColor: colors.primary }]}
              value={editValues.adresse}
              onChangeText={(v) => handleChange('adresse', v)}
              placeholder="Adresse"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        ) : null}

        <View style={[styles.nextBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Prochaine arrivee</Text>
          <Text style={[styles.nextValue, { color: colors.text }]} numberOfLines={1}>{nextReservationLabel}</Text>
        </View>

        <View style={styles.ownerRow}>
          <View style={styles.ownerIdentity}>
            <View style={[styles.ownerAvatar, { backgroundColor: `${colors.secondary}18` }]}>
              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: '900' }}>{ownerInitials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.ownerName, { color: colors.text }]} numberOfLines={1}>{bien.proprio?.nom || 'N/A'}</Text>
              <Text style={[styles.ownerMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                {(bien.reservations?.length || 0)} resas · {(bien.taches?.length || 0)} taches
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={[styles.detailsToggle, { borderColor: colors.primary }]}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>{expanded ? 'Masquer' : 'Details'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.floatingActions}>
          <ButtonAction
            isEditing={isEditing}
            colors={colors}
            onEditPress={handleEditPress}
            onCancelEdit={handleCancelEdit}
            onDelete={onDelete}
            bienId={bien.id}
          />
        </View>

        <View style={[styles.totalPrestationBox, { backgroundColor: colors.background, borderColor: colors.primary }]}>
          <Text style={[styles.totalPrestationLabel, { color: colors.textSecondary }]}>Total percu (prestations)</Text>
          <Text style={[styles.totalPrestationValue, { color: colors.primary }]}>
            {Number(totalPrestationPercu || 0).toFixed(2)} EUR
          </Text>
        </View>

        {expanded ? (
          <View style={{ marginTop: 12 }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Proprietaire</Text>
              <View style={[styles.proprioBox, { backgroundColor: colors.background }]}>
                <View style={[styles.avatarCircle, { backgroundColor: `${colors.secondary}18` }]}>
                  <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>{bien.proprio?.nom || 'N/A'}</Text>
                  <Text style={{ color: colors.textSecondary }}>{bien.proprio?.email || ''}</Text>
                  <Text style={{ color: colors.textSecondary }}>{bien.proprio?.telephone || ''}</Text>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Equipements</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoValue, { color: colors.text, borderBottomWidth: 1, borderColor: colors.primary }]}
                  value={editValues.equipements}
                  onChangeText={(v) => handleChange('equipements', v)}
                  placeholder="Equipements separes par des virgules"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={[styles.infoValue, { color: colors.text }]}>{Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-')}</Text>
              )}
            </View>

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Reservations :</Text>
            </View>
            {sortedReservations.length > 0 ? (
              <View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                {sortedReservations.map((resa: any) => (
                  <ReservationItem key={resa.id} resa={resa} colors={colors} formatDateFR={formatDateFR} />
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune reservation</Text>
            )}

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Taches :</Text>
            </View>
            {bien.taches && bien.taches.length > 0 ? (
              <View style={styles.timeline}>
                {bien.taches.map((tache: any) => (
                  <TacheItem key={tache.id} tache={tache} colors={colors} formatDateFR={formatDateFR} />
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tache</Text>
            )}

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
            </View>
            {bien.prestations && bien.prestations.length > 0 ? (
              <View style={styles.timeline}>
                {bien.prestations.map((prestation: any) => (
                  <PrestationItem key={prestation.id} prestation={prestation} colors={colors} formatDateFR={formatDateFR} />
                ))}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune prestation</Text>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default React.memo(BienCard, shouldReRender);
