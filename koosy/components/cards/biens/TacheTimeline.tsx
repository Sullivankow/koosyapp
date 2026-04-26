import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Tache } from '../../../models/models';

/**
 * Composant TacheTimeline
 * Affiche la liste des tâches d'un bien sous forme de timeline.
 * Affiche un message si aucune tâche n'est présente.
 * Props :
 *   - taches : tableau de tâches
 *   - colors : palette de couleurs pour le thème
 *   - formatDateFR : fonction de formatage de date en français
 *   - styles : styles globaux
 */
interface TacheTimelineProps {
  taches?: Tache[];
  colors: any;
  formatDateFR: (dateStr?: string) => string;
  styles: any;
}

const TacheTimeline: React.FC<TacheTimelineProps> = ({ taches = [], colors, formatDateFR, styles }) => (
  <View style={styles.timeline}>
    {/* Si des tâches existent, on les affiche */}
    {Array.isArray(taches) && taches.length > 0 ? taches.map((tache) => (
      <View key={tache.id} style={styles.timelineItem}>
        {/* Point de la timeline, couleur selon le statut */}
        <MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'à faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
        <View style={{ flex: 1 }}>
          {/* Titre de la tâche */}
          <Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre || 'N/A'}</Text>
          {/* Détails : statut et date d'échéance */}
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
        </View>
      </View>
    )) : (
      // Message si aucune tâche
      <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tâche</Text>
    )}
  </View>
);

export default React.memo(TacheTimeline);