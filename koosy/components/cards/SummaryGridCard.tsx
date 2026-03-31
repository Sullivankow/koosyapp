import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SummaryGridCardProps {
  biensCount: number;
  reservationsCount: number;
  tacheCount: number;
  prestationsTerminees: number;
}

const SummaryGridCard: React.FC<SummaryGridCardProps> = ({ biensCount, reservationsCount, tacheCount, prestationsTerminees }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="view-grid" size={24} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: colors.primary }]}>Résumé</Text>
      </View>
      <View style={styles.valuesGrid}>
        <View style={styles.rowGrid}>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]}> 
            <FontAwesome5 name="building" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Biens</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{biensCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]}> 
            <FontAwesome5 name="calendar-check" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Réserv.</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{reservationsCount}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowGrid}>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]}> 
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Tâches à faire</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{tacheCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]}> 
            <MaterialCommunityIcons name="check-decagram" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Prest. finies</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{prestationsTerminees}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 12,
    alignItems: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    width: '98%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  valuesGrid: {
    width: '100%',
    marginTop: 12,
  },
  rowGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  valueBoxGrid: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 90,
    maxWidth: 180,
  },
  labelGrid: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  valueGrid: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SummaryGridCard;
