import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface SummaryCountersProps {
  biensCount: number;
  reservationsCount: number;
  tacheCount: number;
  colors: any;
  styles: any;
}

const SummaryCounters: React.FC<SummaryCountersProps> = ({ biensCount, reservationsCount, tacheCount, colors, styles }) => (
  <View style={styles.summaryContainer}>
    <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
      <FontAwesome5 name="building" size={22} color={colors.primary} style={{ marginBottom: 5 }} />
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Biens</Text>
      <Text style={[styles.summaryValue, { color: colors.primary }]}>{biensCount}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
      <FontAwesome5 name="calendar-check" size={22} color={colors.primary} style={{ marginBottom: 5 }} />
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Réserv.</Text>
      <Text style={[styles.summaryValue, { color: colors.primary }]}>{reservationsCount}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.summaryBox, { backgroundColor: colors.surface }]}> 
      <MaterialCommunityIcons name="alert-circle" size={22} color={colors.error} style={{ marginBottom: 5 }} />
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tâches à faire</Text>
      <Text style={[styles.summaryValue, { color: colors.error }]}>{tacheCount}</Text>
    </TouchableOpacity>
  </View>
);

export default SummaryCounters;
