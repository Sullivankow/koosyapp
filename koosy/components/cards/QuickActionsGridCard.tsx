import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';


interface QuickActionsGridCardProps {
  onAddBien: () => void;
  onAddTache: () => void;
  onAddReservation: () => void;
  onAddPrestation: () => void;
  onGoToDevis: () => void;
  onGoToFacture: () => void;
}

const QuickActionsGridCard: React.FC<QuickActionsGridCardProps> = ({
  onAddBien,
  onAddTache,
  onAddReservation,
  onAddPrestation,
  onGoToDevis,
  onGoToFacture,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={[styles.title, { color: colors.primary }]}>Actions rapides</Text>
      </View>
      <View style={styles.valuesGrid}>
        <View style={styles.rowGrid}>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddBien}>
            <FontAwesome5 name="building" size={16} color={colors.surface} style={{ marginBottom: 1 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Ajouter un bien</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddTache}>
            <MaterialCommunityIcons name="playlist-plus" size={16} color={colors.surface} style={{ marginBottom: 1 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Mes tâches</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onGoToDevis}>
            <MaterialCommunityIcons name="file-document-edit" size={16} color={colors.surface} style={{ marginBottom: 1 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Mes devis</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowGrid}>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddReservation}>
            <MaterialCommunityIcons name="calendar-plus" size={16} color={colors.surface} style={{ marginBottom: 1 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Ajouter une résa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onAddPrestation}>
            <FontAwesome5 name="user-plus" size={16} color={colors.surface} style={{ marginBottom: 1 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Presta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onGoToFacture}>
            <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.surface} style={{ marginBottom: 1 }} />
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Mes factures</Text>
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
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.2,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 2,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 80,
    maxWidth: 120,
  },
  labelGrid: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default QuickActionsGridCard;
