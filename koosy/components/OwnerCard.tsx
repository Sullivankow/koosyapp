import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Proprietaire } from '../models/models';

type OwnerCardProps = {
  owner: Proprietaire;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onPress?: () => void;
};

import { useTheme } from '../contexts/ThemeContext';

export default function OwnerCard({ owner, onEdit, onDelete, onPress }: OwnerCardProps) {
  const { colors } = useTheme();
  const initials = `${(owner.prenom?.charAt(0) ?? '')}${(owner.nom?.charAt(0) ?? '')}`.toUpperCase();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <View style={styles.left}> 
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}22`, borderColor: colors.primary }]}> 
          <Text style={[styles.avatarText, { color: colors.primary }]}>{initials || 'U'}</Text>
        </View>
      </View>

      <View style={styles.content}> 
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{owner.prenom} {owner.nom}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{owner.email}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{owner.telephone}</Text>
      </View>

      <View style={styles.actions}> 
        <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
          <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete?.(owner.id)} style={styles.iconBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  left: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 8,
  },
});
