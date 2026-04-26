import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProprioBox from '../cards/biens/ProprioBox';
import type { Bien } from '../../models/models';
import ReservationList from '../cards/biens/ReservationList';
import PrestationTimeline from '../cards/biens/PrestationTimeline';
import TacheTimeline from '../cards/biens/TacheTimeline';

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

function BienDetailsModal(props: BienDetailsModalProps) {
  const { visible, onClose, bien, localProprio, totalPrestationPercu, colors, formatDateFR, styles } = props;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.detailsModalOverlay}>
        <View style={[styles.detailsModalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.detailsModalHeader}>
            <Text style={[styles.detailsModalTitle, { color: colors.text }]}>Détails du bien</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.detailsModalBody}>
            <View>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Propriétaire</Text>
              <ProprioBox proprio={localProprio} colors={colors} styles={styles} />
            </View>

            <View style={{ marginTop: 6 }}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary, marginTop: 4 }]}>Équipements</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-')}
              </Text>
            </View>

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Réservations :</Text>
            </View>
            <ReservationList reservations={bien.reservations} colors={colors} formatDateFR={formatDateFR} styles={styles} />

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Tâches :</Text>
            </View>
            <TacheTimeline taches={bien.taches} colors={colors} formatDateFR={formatDateFR} styles={styles} />

            <View style={styles.sectionRow}>
              <MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
            </View>
            <PrestationTimeline prestations={bien.prestations} colors={colors} formatDateFR={formatDateFR} styles={styles} />

            <View style={{ marginTop: 10, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Total perçu (prestations)</Text>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{Number(totalPrestationPercu || 0).toFixed(2)} €</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default BienDetailsModal;
