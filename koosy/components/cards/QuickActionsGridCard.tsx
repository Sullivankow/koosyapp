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
  onGoToPlanning: () => void;
  onGoToCharges: () => void;
}

const QuickActionsGridCard: React.FC<QuickActionsGridCardProps> = ({
  onAddBien,
  onAddTache,
  onAddReservation,
  onAddPrestation,
  onGoToDevis,
  onGoToFacture,
  onGoToPlanning,
  onGoToCharges,
}) => {
  const { colors, isDarkMode } = useTheme();
  const brandColor = isDarkMode ? colors.secondary : (colors.primary || '#145C53');
  const actions = [
    { label: 'Ajouter un bien', icon: 'building' as const, family: 'fa', onPress: onAddBien },
    { label: 'Mes taches', icon: 'playlist-plus' as const, family: 'mc', onPress: onAddTache },
    { label: 'Reservation', icon: 'calendar-plus' as const, family: 'mc', onPress: onAddReservation },
    { label: 'Prestation', icon: 'account-plus-outline' as const, family: 'mc', onPress: onAddPrestation },
    { label: 'Devis', icon: 'file-document-edit-outline' as const, family: 'mc', onPress: onGoToDevis },
    { label: 'Factures', icon: 'file-document-outline' as const, family: 'mc', onPress: onGoToFacture },
    { label: 'Planning', icon: 'calendar-clock-outline' as const, family: 'mc', onPress: onGoToPlanning },
    { label: 'Charges', icon: 'cash-multiple' as const, family: 'mc', onPress: onGoToCharges },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Actions rapides</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Les commandes du quotidien</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: `${brandColor}18` }]}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={21} color={brandColor} />
        </View>
      </View>

      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.label}
            style={[
              styles.action,
              {
                backgroundColor: index === 0 ? brandColor : '#F8FBFA',
                borderColor: index === 0 ? brandColor : '#D9E2EC',
              },
            ]}
            onPress={action.onPress}
            activeOpacity={0.82}
          >
            <View style={[styles.actionIcon, { backgroundColor: index === 0 ? 'rgba(255,255,255,0.16)' : `${brandColor}12` }]}>
              {action.family === 'fa' ? (
                <FontAwesome5 name={action.icon as any} size={15} color={index === 0 ? (colors.surface || '#FFFFFF') : brandColor} />
              ) : (
                <MaterialCommunityIcons name={action.icon as any} size={19} color={index === 0 ? (colors.surface || '#FFFFFF') : brandColor} />
              )}
            </View>
            <Text style={[styles.actionText, { color: index === 0 ? (colors.surface || '#FFFFFF') : colors.text }]} numberOfLines={2}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 4,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  action: {
    width: '48%',
    minHeight: 74,
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  },
});

export default QuickActionsGridCard;
