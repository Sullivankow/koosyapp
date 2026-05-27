import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { Proprietaire } from '../models/models';
import { useTheme } from '../contexts/ThemeContext';

type OwnerCardProps = {
  owner: Proprietaire;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onPress?: () => void;
};

function OwnerCard({ owner, onEdit, onDelete, onPress }: OwnerCardProps) {
  const { colors } = useTheme();

  // Initiales calculees une seule fois par proprietaire pour garder la carte legere.
  const initials = useMemo(() => {
    return `${owner.prenom?.charAt(0) ?? ''}${owner.nom?.charAt(0) ?? ''}`.toUpperCase() || 'P';
  }, [owner.nom, owner.prenom]);

  const fullName = `${owner.prenom || ''} ${owner.nom || ''}`.trim() || 'Sans nom';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
    >
      <View style={[styles.avatar, { backgroundColor: `${colors.primary}16`, borderColor: `${colors.primary}44` }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{fullName}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{owner.email || 'Email non renseigne'}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity accessibilityLabel="Modifier proprietaire" onPress={onPress || (() => onEdit?.(owner.id))} style={[styles.iconBtn, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Supprimer proprietaire" onPress={() => onDelete?.(owner.id)} style={[styles.iconBtn, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.addressBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>{owner.adresse || 'Adresse non renseignee'}</Text>
        </View>

        <View style={styles.contactRow}>
          <View style={[styles.contactChip, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}22` }]}>
            <MaterialCommunityIcons name="email-outline" size={14} color={colors.primary} />
            <Text style={[styles.contactText, { color: colors.primary }]}>Email</Text>
          </View>
          <View style={[styles.contactChip, { backgroundColor: `${colors.secondary}12`, borderColor: `${colors.secondary}24` }]}>
            <MaterialCommunityIcons name="phone-outline" size={14} color={colors.secondary} />
            <Text style={[styles.contactText, { color: colors.secondary }]} numberOfLines={1}>{owner.telephone || 'Telephone'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 22,
    padding: 14,
    marginHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 3,
  },
  meta: {
    fontSize: 12,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBox: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '800',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  contactChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  contactText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: '900',
  },
});

export default React.memo(OwnerCard);
