import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChiffreAffaireCardProps {
  caMois: number;
  caGlobal: number;
}

const ChiffreAffaireCard: React.FC<ChiffreAffaireCardProps> = ({ caMois, caGlobal }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="chart-bar" size={28} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: colors.primary }]}>Chiffre d'affaires</Text>
      </View>
      <View style={styles.valuesRow}>
        <View style={styles.valueBox}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Du mois</Text>
          <Text style={[styles.value, { color: colors.success }]}>{caMois.toFixed(2)} €</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.value, { color: colors.primary }]}>{caGlobal.toFixed(2)} €</Text>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default ChiffreAffaireCard;
