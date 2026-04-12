import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChiffreAffaireCardProps {
  caMois: number;
  caGlobal: number;
  caAnnee: number;
  caMoisN1: number;
  caJour: number; // CA du jour
  caJourN1: number; // CA jour N-1
  caAnneeN1: number; // CA année N-1 (YTD)
  caMoisN2: number; // CA mois N-2
  margeMois: number;
  margeGlobal: number;
  margeAnnee: number;
  margeMoisN1: number;
  margeJour: number; // Marge du jour
  margeJourN1: number; // Marge jour N-1
  margeAnneeN1: number; // Marge année N-1 (YTD)
  margeMoisN2: number; // Marge mois N-2
}

  const formatSignedAmount = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)} €`;
  };

const ChiffreAffaireCard: React.FC<ChiffreAffaireCardProps> = ({
  caMois,
  caGlobal,
  caAnnee,
  caMoisN1,
  caJour,
  caJourN1,
  caAnneeN1,
  caMoisN2,
  margeMois,
  margeGlobal,
  margeAnnee,
  margeMoisN1,
  margeJour,
  margeJourN1,
  margeAnneeN1,
  margeMoisN2,
}) => {
  const { colors } = useTheme();
  const [activePeriod, setActivePeriod] = useState<'current' | 'n1'>('current');

  const renderSection = (
    revenueData: { jour: number; mois: number; annee: number; moisN1: number; global: number },
    marginData: { jour: number; mois: number; annee: number; moisN1: number; global: number }
  ) => (
    <View style={styles.sectionWrapper}>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenus</Text>
        <View style={styles.gridContainer}>
          <View style={[styles.smallBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.smallLabel, { color: colors.surface }]}>Jour</Text>
            <Text style={[styles.smallValue, { color: colors.surface }]}>{revenueData.jour.toFixed(2)} €</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.smallLabel, { color: colors.surface }]}>Mois</Text>
            <Text style={[styles.smallValue, { color: colors.surface }]}>{revenueData.mois.toFixed(2)} €</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.smallLabel, { color: colors.surface }]}>Année</Text>
            <Text style={[styles.smallValue, { color: colors.surface }]}>{revenueData.annee.toFixed(2)} €</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.smallLabel, { color: colors.surface }]}>Mois N-1</Text>
            <Text style={[styles.smallValue, { color: colors.surface }]}>{revenueData.moisN1.toFixed(2)} €</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: colors.primary }]}>
            <Text style={[styles.smallLabel, { color: colors.surface }]}>Global</Text>
            <Text style={[styles.smallValue, { color: colors.surface }]}>{revenueData.global.toFixed(2)} €</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Marges</Text>
        <View style={styles.gridContainer}>
          <View style={[styles.smallBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
            <Text style={[styles.smallLabel, { color: '#2E7D32' }]}>Jour</Text>
            <Text style={[styles.smallValue, { color: '#2E7D32' }]}>{formatSignedAmount(marginData.jour)}</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
            <Text style={[styles.smallLabel, { color: '#2E7D32' }]}>Mois</Text>
            <Text style={[styles.smallValue, { color: '#2E7D32' }]}>{formatSignedAmount(marginData.mois)}</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
            <Text style={[styles.smallLabel, { color: '#2E7D32' }]}>Année</Text>
            <Text style={[styles.smallValue, { color: '#2E7D32' }]}>{formatSignedAmount(marginData.annee)}</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
            <Text style={[styles.smallLabel, { color: '#2E7D32' }]}>Mois N-1</Text>
            <Text style={[styles.smallValue, { color: '#2E7D32' }]}>{formatSignedAmount(marginData.moisN1)}</Text>
          </View>
          <View style={[styles.smallBox, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
            <Text style={[styles.smallLabel, { color: '#2E7D32' }]}>Global</Text>
            <Text style={[styles.smallValue, { color: '#2E7D32' }]}>{formatSignedAmount(marginData.global)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const isCurrent = activePeriod === 'current';
  const revenueData = isCurrent
    ? { jour: caJour, mois: caMois, annee: caAnnee, moisN1: caMoisN1, global: caGlobal }
    : { jour: caJourN1, mois: caMoisN1, annee: caAnneeN1, moisN1: caMoisN2, global: caGlobal };

  const marginData = isCurrent
    ? { jour: margeJour, mois: margeMois, annee: margeAnnee, moisN1: margeMoisN1, global: margeGlobal }
    : { jour: margeJourN1, mois: margeMoisN1, annee: margeAnneeN1, moisN1: margeMoisN2, global: margeGlobal };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="chart-bar" size={28} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.title, { color: colors.primary }]}>Chiffre d'affaire</Text>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActivePeriod('current')}
          style={[
            styles.tabBtn,
            {
              backgroundColor: activePeriod === 'current' ? colors.primary : colors.surface,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.tabText, { color: activePeriod === 'current' ? colors.surface : colors.primary }]}>Actuel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActivePeriod('n1')}
          style={[
            styles.tabBtn,
            {
              backgroundColor: activePeriod === 'n1' ? colors.primary : colors.surface,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.tabText, { color: activePeriod === 'n1' ? colors.surface : colors.primary }]}>N-1</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.periodCaption, { color: colors.text }]}>{isCurrent ? 'Période actuelle' : 'Période N-1'}</Text>

      {renderSection(revenueData, marginData)}
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
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  section: {
    width: '100%',
    marginBottom: 18,
  },
  tabsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  periodCaption: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    opacity: 0.7,
  },
  sectionWrapper: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  smallBox: {
    width: '48%',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    opacity: 0.9,
  },
  smallValue: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ChiffreAffaireCard;
