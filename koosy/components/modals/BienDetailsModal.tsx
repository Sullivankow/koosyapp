import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import type { Bien } from '../../models/models';

interface BienDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  bien: Bien & { photos?: (string | { uri: string })[] };
  localProprio: Bien['proprio'];
  totalPrestationPercu: number;
  colors: {
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    text: string;
    textSecondary: string;
  };
  formatDateFR: (dateStr?: string) => string;
  styles: any;
}

const ReservationListInline = React.memo(function ReservationListInline({ reservations, colors, formatDateFR }: { reservations?: any[]; colors: any; formatDateFR: (d?: string) => string }) {
  const sorted = useMemo(() => {
    return [...(reservations || [])].sort((a: any, b: any) => {
      return new Date(a.dateDebut ?? 0).getTime() - new Date(b.dateDebut ?? 0).getTime();
    });
  }, [reservations]);

  if (sorted.length === 0) {
    return <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune reservation</Text>;
  }

  return (
    <View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
      {sorted.map((resa: any) => (
        <View key={resa.id} style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.accent + '22', borderColor: colors.accent, borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 2 }}>
          <MaterialCommunityIcons name="account" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>{resa.locataire?.nom || ''} {resa.locataire?.prenom || ''}</Text>
            {resa.locataire?.email ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.email}</Text> : null}
            {resa.locataire?.telephone ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.telephone}</Text> : null}
            <Text style={{ color: '#1976D2', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{formatDateFR(resa.dateDebut)} - {formatDateFR(resa.dateFin)}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.statut ? resa.statut.charAt(0).toUpperCase() + resa.statut.slice(1) : ''}</Text>
          </View>
        </View>
      ))}
    </View>
  );
});

const TacheTimelineInline = React.memo(function TacheTimelineInline({ taches, colors, formatDateFR, styles }: { taches?: any[]; colors: any; formatDateFR: (d?: string) => string; styles: any }) {
  if (!taches || taches.length === 0) {
    return <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tache</Text>;
  }

  return (
    <View style={styles.timeline}>
      {taches.map((tache: any) => (
        <View key={tache.id} style={styles.timelineItem}>
          <MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'a faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre || 'N/A'}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
          </View>
        </View>
      ))}
    </View>
  );
});

const PrestationTimelineInline = React.memo(function PrestationTimelineInline({ prestations, colors, formatDateFR, styles }: { prestations?: any[]; colors: any; formatDateFR: (d?: string) => string; styles: any }) {
  if (!prestations || prestations.length === 0) {
    return <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune prestation</Text>;
  }

  return (
    <View style={styles.timeline}>
      {prestations.map((prestation: any) => (
        <View key={prestation.id} style={styles.timelineItem}>
          <MaterialCommunityIcons name="circle" size={10} color={prestation.status === 'terminee' ? colors.accent : colors.error} style={{ marginRight: 6 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '500' }}>{prestation.description || 'N/A'}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {prestation.status} {prestation.date_prestation ? `- ${formatDateFR(prestation.date_prestation)}` : ''}
              {typeof prestation.amount_cents === 'number' && prestation.amount_cents > 0 ? ` - ${(prestation.amount_cents / 100).toFixed(2)} EUR` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
});

const ProprioBoxInline = React.memo(function ProprioBoxInline({ proprio, colors, styles }: { proprio?: any; colors: any; styles: any }) {
  return (
    <View style={styles.proprioBox}>
      <View style={styles.avatarCircle}>
        <FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{proprio?.nom || 'N/A'}</Text>
        <Text style={{ color: colors.textSecondary }}>{proprio?.email || ''}</Text>
        <Text style={{ color: colors.textSecondary }}>{proprio?.telephone || ''}</Text>
      </View>
    </View>
  );
});

function BienDetailsModal(props: BienDetailsModalProps) {
  const { visible, onClose, bien, localProprio, totalPrestationPercu, colors, formatDateFR, styles } = props;

  const equipementsText = useMemo(() => {
    return Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-');
  }, [bien.equipements]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailsModalOverlay}>
        <View style={[styles.detailsModalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.detailsModalHeader}>
            <Text style={[styles.detailsModalTitle, { color: colors.text }]}>Details du bien</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.detailsModalBody}>
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Proprietaire</Text>
              <ProprioBoxInline proprio={localProprio} colors={colors} styles={styles} />
            </View>

            <View style={{ marginTop: 6 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary, marginTop: 4 }]}>Equipements</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{equipementsText}</Text>
            </View>

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Reservations :</Text>
            </View>
            <ReservationListInline reservations={bien.reservations} colors={colors} formatDateFR={formatDateFR} />

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Taches :</Text>
            </View>
            <TacheTimelineInline taches={bien.taches} colors={colors} formatDateFR={formatDateFR} styles={styles} />

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
            </View>
            <PrestationTimelineInline prestations={bien.prestations} colors={colors} formatDateFR={formatDateFR} styles={styles} />

            <View style={{ marginTop: 10, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Total percu (prestations)</Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{Number(totalPrestationPercu || 0).toFixed(2)} EUR</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default React.memo(BienDetailsModal);