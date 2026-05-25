import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ChiffreAffaireCardProps {
  caMois: number;
  caGlobal: number;
  caAnnee: number;
  caMoisN1: number;
  caJour: number;
  caJourN1: number;
  caAnneeN1: number;
  caMoisN2: number;
  margeMois: number;
  margeGlobal: number;
  margeAnnee: number;
  margeMoisN1: number;
  margeJour: number;
  margeJourN1: number;
  margeAnneeN1: number;
  margeMoisN2: number;
}

const formatAmount = (value: number) => `${Number(value || 0).toFixed(2)} EUR`;
const formatSignedAmount = (value: number) => `${value > 0 ? '+' : ''}${Number(value || 0).toFixed(2)} EUR`;

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
  const { colors, isDarkMode } = useTheme();
  const [activePeriod, setActivePeriod] = useState<'current' | 'n1'>('current');
  const brandColor = isDarkMode ? colors.secondary : (colors.primary || '#145C53');
  const isCurrent = activePeriod === 'current';
  const revenueData = isCurrent
    ? { jour: caJour, mois: caMois, annee: caAnnee, previous: caMoisN1, global: caGlobal }
    : { jour: caJourN1, mois: caMoisN1, annee: caAnneeN1, previous: caMoisN2, global: caGlobal };
  const marginData = isCurrent
    ? { jour: margeJour, mois: margeMois, annee: margeAnnee, previous: margeMoisN1, global: margeGlobal }
    : { jour: margeJourN1, mois: margeMoisN1, annee: margeAnneeN1, previous: margeMoisN2, global: margeGlobal };
  const monthMarginPositive = marginData.mois >= 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Chiffre d'affaire</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Revenus et marge</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: `${brandColor}18` }]}>
          <MaterialCommunityIcons name="chart-bar" size={22} color={brandColor} />
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActivePeriod('current')}
          style={[styles.tabBtn, { backgroundColor: isCurrent ? brandColor : '#F8FBFA', borderColor: isCurrent ? brandColor : '#D9E2EC' }]}
        >
          <Text style={[styles.tabText, { color: isCurrent ? '#FFFFFF' : colors.text }]}>Actuel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActivePeriod('n1')}
          style={[styles.tabBtn, { backgroundColor: !isCurrent ? brandColor : '#F8FBFA', borderColor: !isCurrent ? brandColor : '#D9E2EC' }]}
        >
          <Text style={[styles.tabText, { color: !isCurrent ? '#FFFFFF' : colors.text }]}>N-1</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.heroMetric, { backgroundColor: brandColor }]}>
        <Text style={styles.heroLabel}>CA du mois</Text>
        <Text style={styles.heroValue}>{formatAmount(revenueData.mois)}</Text>
        <Text style={styles.heroSub}>Global: {formatAmount(revenueData.global)}</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.smallBox}>
          <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Jour</Text>
          <Text style={[styles.smallValue, { color: colors.text }]}>{formatAmount(revenueData.jour)}</Text>
        </View>
        <View style={styles.smallBox}>
          <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Annee</Text>
          <Text style={[styles.smallValue, { color: colors.text }]}>{formatAmount(revenueData.annee)}</Text>
        </View>
          <View style={styles.smallBox}>
            <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Marge mois</Text>
            <Text style={[styles.smallValue, { color: monthMarginPositive ? (colors.success || '#2E8B57') : (colors.error || '#B44B4B') }]}>{formatSignedAmount(marginData.mois)}</Text>
          </View>
          <View style={styles.smallBox}>
            <Text style={[styles.smallLabel, { color: colors.textSecondary }]}>Marge globale</Text>
            <Text style={[styles.smallValue, { color: marginData.global >= 0 ? (colors.success || '#2E8B57') : (colors.error || '#B44B4B') }]}>{formatSignedAmount(marginData.global)}</Text>
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(23,32,42,0.06)',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontWeight: '900',
    fontSize: 17,
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '700',
    fontSize: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '900',
  },
  heroMetric: {
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallBox: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#F8FBFA',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    padding: 12,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  smallValue: {
    fontSize: 14,
    fontWeight: '900',
  },
});

export default ChiffreAffaireCard;
