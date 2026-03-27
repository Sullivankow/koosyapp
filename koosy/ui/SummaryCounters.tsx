// Grille de compteurs réutilisable affichée sur le dashboard (biens, réservations,
// tâches à faire, prestations terminées).
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface SummaryCountersProps {
  biensCount: number;
  reservationsCount: number;
  tacheCount: number;
  prestationsTerminees: number;
  colors: any;
  styles: any;
}

const SummaryCounters: React.FC<SummaryCountersProps> = ({ biensCount, reservationsCount, tacheCount, prestationsTerminees, colors, styles }) => (
  <View style={styles.summaryGrid}>
    <View style={styles.summaryRow}>
      <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
        <FontAwesome5 name="building" size={20} color={colors.primary} style={{ marginBottom: 2 }} />
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Biens</Text>
        <Text style={[styles.summaryValue, { color: colors.primary }]}>{biensCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
        <FontAwesome5 name="calendar-check" size={20} color={colors.primary} style={{ marginBottom: 2 }} />
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Réserv.</Text>
        <Text style={[styles.summaryValue, { color: colors.primary }]}>{reservationsCount}</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.summaryRow}>
      <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
        <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} style={{ marginBottom: 2 }} />
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tâches à faire</Text>
        <Text style={[styles.summaryValue, { color: colors.error }]}>{tacheCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
        <MaterialCommunityIcons name="check-decagram" size={20} color={colors.success || '#43A047'} style={{ marginBottom: 2 }} />
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Prest. finies</Text>
        <Text style={[styles.summaryValue, { color: colors.success || '#43A047'}]}>{prestationsTerminees}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default SummaryCounters;
