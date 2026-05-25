import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface SummaryGridCardProps {
  biensCount: number;
  reservationsCount: number;
  tacheCount: number;
  prestationsTerminees: number;
}

const SummaryGridCard: React.FC<SummaryGridCardProps> = ({ biensCount, reservationsCount, tacheCount, prestationsTerminees }) => {
  const { colors, isDarkMode } = useTheme();
  const brandColor = isDarkMode ? colors.secondary : (colors.primary || '#145C53');
  const items = [
    { label: 'Biens', value: biensCount, icon: 'building' as const, family: 'fa' },
    { label: 'Reservations', value: reservationsCount, icon: 'calendar-check' as const, family: 'fa' },
    { label: 'Taches', value: tacheCount, icon: 'clipboard-alert-outline' as const, family: 'mc' },
    { label: 'Prestations', value: prestationsTerminees, icon: 'check-decagram-outline' as const, family: 'mc' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: `${brandColor}18` }]}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={brandColor} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Resume</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Vue rapide de votre activite</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={[styles.metricIcon, { backgroundColor: `${brandColor}12` }]}>
              {item.family === 'fa' ? (
                <FontAwesome5 name={item.icon as any} size={15} color={brandColor} />
              ) : (
                <MaterialCommunityIcons name={item.icon as any} size={18} color={brandColor} />
              )}
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{item.value}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]} numberOfLines={1}>{item.label}</Text>
          </View>
        ))}
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
    marginBottom: 14,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F8FBFA',
    borderWidth: 1,
    borderColor: '#D9E2EC',
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
});

export default SummaryGridCard;
