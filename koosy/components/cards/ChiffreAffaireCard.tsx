import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChiffreAffaireCardProps {
  caMois: number;
  caGlobal: number;
  caAnnee: number; // Ajout CA année
  caMoisN1: number; // Ajout CA mois n-1
}

const ChiffreAffaireCard: React.FC<ChiffreAffaireCardProps> = ({ caMois, caGlobal, caAnnee, caMoisN1 }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="chart-bar" size={28} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: colors.primary }]}>Chiffre d'affaires</Text>
      </View>
      <View style={styles.valuesGrid}>
        <View style={styles.rowGrid}>
          <View style={[styles.valueBoxGrid, { backgroundColor: colors.success, borderColor: colors.success }]}> 
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Mois en cours</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{caMois.toFixed(2)} €</Text>
          </View>
          <View style={[styles.valueBoxGrid, { backgroundColor: colors.info, borderColor: colors.info }]}> 
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Année en cours</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{caAnnee.toFixed(2)} €</Text>
          </View>
        </View>
        <View style={styles.rowGrid}>
          <View style={[styles.valueBoxGrid, { backgroundColor: '#FFA07A', borderColor: '#FFA07A' }]}> 
            <Text style={[styles.labelGrid, { color: colors.surface }]}>Mois précédent</Text>
            <Text style={[styles.valueGrid, { color: colors.surface }]}>{caMoisN1.toFixed(2)} €</Text>
          </View>
          <View style={[styles.valueBoxGrid, { backgroundColor: colors.primary, borderColor: colors.primary, flex: 1, justifyContent: 'center' }]}> 
            <Text style={[styles.labelGrid, { color: colors.surface, textAlign: 'center' }]}>Total global</Text>
            <Text style={[styles.valueGrid, { color: colors.surface, textAlign: 'center' }]}>{caGlobal.toFixed(2)} €</Text>
          </View>
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
  },
  valueGrid: {
    fontSize: 18, // taille réduite
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default ChiffreAffaireCard;
