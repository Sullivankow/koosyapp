import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Prestation } from '../../../models/models';

/**
 * Composant PrestationTimeline
 * Affiche la liste des prestations d'un bien sous forme de timeline.
 * Affiche un message si aucune prestation n'est présente.
 * Props :
 *   - prestations : tableau de prestations
 *   - colors : palette de couleurs pour le thème
 *   - formatDateFR : fonction de formatage de date en français
 *   - styles : styles globaux
 */
interface PrestationTimelineProps {
  prestations?: Prestation[];
  colors: any;
  formatDateFR: (dateStr?: string) => string;
  styles: any;
}

const PrestationTimeline: React.FC<PrestationTimelineProps> = ({ prestations = [], colors, formatDateFR, styles }) => (
  <View style={styles.timeline}>
    {/* Si des prestations existent, on les affiche */}
    {Array.isArray(prestations) && prestations.length > 0 ? prestations.map((prestation) => (
      <View key={prestation.id} style={styles.timelineItem}>
        {/* Point de la timeline, couleur selon le statut */}
        <MaterialCommunityIcons name="circle" size={10} color={prestation.status === 'terminée' ? colors.accent : colors.error} style={{ marginRight: 6 }} />
        <View style={{ flex: 1 }}>
          {/* Description de la prestation */}
          <Text style={{ color: colors.text, fontWeight: '500' }}>{prestation.description || 'N/A'}</Text>
          {/* Détails : statut, date, montant */}
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            {prestation.status} {prestation.date_prestation ? `- ${formatDateFR(prestation.date_prestation)}` : ''}
            {typeof prestation.amount_cents === 'number' && prestation.amount_cents > 0 ? ` - ${(prestation.amount_cents / 100).toFixed(2)} €` : ''}
          </Text>
        </View>
      </View>
    )) : (
      // Message si aucune prestation
      <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune prestation</Text>
    )}
  </View>
);

export default PrestationTimeline;