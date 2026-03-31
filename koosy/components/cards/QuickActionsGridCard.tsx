import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface QuickActionsGridCardProps {
  onAddBien: () => void;
  onAddTache: () => void;
  onAddReservation: () => void;
  onAddPrestation: () => void;
}

const QuickActionsGridCard: React.FC<QuickActionsGridCardProps> = ({ onAddBien, onAddTache, onAddReservation, onAddPrestation }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="lightning-bolt" size={24} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: colors.primary }]}>Actions rapides</Text>
      </View>
      <View style={styles.valuesGrid}>
        <View style={styles.rowGrid}>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddBien}>
            <FontAwesome5 name="building" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Ajouter un bien</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddTache}>
            <MaterialCommunityIcons name="playlist-plus" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Mes tâches</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowGrid}>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddReservation}>
            <MaterialCommunityIcons name="calendar-plus" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Ajouter une résa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddPrestation}>
            <FontAwesome5 name="user-plus" size={20} color={colors.surface} style={{ marginBottom: 2 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Ajouter une prestation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 16,
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
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120,
    maxWidth: 260,
  },
  labelGrid: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default QuickActionsGridCard;
