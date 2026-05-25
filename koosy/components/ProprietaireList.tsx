import React, { memo, useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Proprietaire } from '../models/models';
import { useTheme } from '../contexts/ThemeContext';

// Props attendues par le composant de liste des propriétaires
interface ProprietaireListProps {
  data: Proprietaire[];
  loading?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, data: Partial<Proprietaire>) => Promise<void>;
}
// Composant d'affichage et d'édition en ligne des propriétaires
const ProprietaireItem = memo(function ProprietaireItem({ item, onEdit, onDelete, colors }: { item: Proprietaire; onEdit?: (id: number, data: Partial<Proprietaire>) => Promise<void>; onDelete?: (id: number) => void; colors: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<Partial<Proprietaire>>({});

  const initials = `${(item.prenom?.charAt(0) ?? '')}${(item.nom?.charAt(0) ?? '')}`.toUpperCase();

  return (
    <View style={[styles.card, styles.cardRow, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors.primary }]}> 
      <View style={styles.cardContent}>
        {isEditing ? (
          <>
            <TextInput
              style={[styles.name, styles.editNameInput, { color: colors.primary, borderColor: colors.border }]}
              value={values.nom ?? item.nom}
              onChangeText={(v) => setValues(ev => ({ ...ev, nom: v }))}
              placeholder="Nom"
            />
            <TextInput
              style={[styles.name, styles.editNameInput, { color: colors.primary, borderColor: colors.border }]}
              value={values.prenom ?? item.prenom}
              onChangeText={(v) => setValues(ev => ({ ...ev, prenom: v }))}
              placeholder="Prénom"
            />
            <TextInput
              style={[styles.info, styles.editInfoInput, { color: colors.text, borderColor: colors.border }]}
              value={values.email ?? item.email}
              onChangeText={(v) => setValues(ev => ({ ...ev, email: v }))}
              placeholder="Email"
            />
            <TextInput
              style={[styles.info, styles.editInfoInput, { color: colors.text, borderColor: colors.border }]}
              value={values.adresse ?? item.adresse}
              onChangeText={(v) => setValues(ev => ({ ...ev, adresse: v }))}
              placeholder="Adresse"
            />
            <View style={styles.editActionsRow}>
              <TouchableOpacity
                style={[styles.iconButton, styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  if (onEdit) await onEdit(item.id, values);
                  setIsEditing(false);
                  setValues({});
                }}
              >
                <MaterialCommunityIcons name="check" size={22} color={colors.surface} />
              </TouchableOpacity>
              <TouchableOpacity
                    style={[styles.iconButton, styles.cancelButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  setIsEditing(false);
                  setValues({});
                }}
              >
                <MaterialCommunityIcons name="close" size={22} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary}22`, borderColor: colors.primary }]}> 
                <Text style={[styles.avatarText, { color: colors.primary }]}>{initials || 'U'}</Text>
              </View>
              <Text style={[styles.name, { color: colors.primary, marginLeft: 12 }]}>{item.nom} {item.prenom}</Text>
            </View>
            <Text style={[styles.info, { color: colors.text }]}>Email : {item.email}</Text>
            <Text style={[styles.info, { color: colors.text }]}>Adresse : {item.adresse}</Text>
            <Text style={[styles.info, { color: colors.text }]}>Téléphone : {item.telephone}</Text>
          </>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionIconButton}>
            <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onDelete && onDelete(item.id)} style={styles.actionIconButton}>
          <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const ProprietaireListComponent: React.FC<ProprietaireListProps> = ({ data, loading, onDelete, onEdit }) => {
  const { colors } = useTheme();

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
  }

  if (!data.length) {
    return <Text style={[styles.emptyText, { color: colors.text }]}>Aucun propriétaire trouvé.</Text>;
  }

  const keyExtractor = useCallback((item: Proprietaire) => item.id.toString(), []);

  const renderItem = useCallback(({ item }: { item: Proprietaire }) => (
    <ProprietaireItem item={item} onEdit={onEdit} onDelete={onDelete} colors={colors} />
  ), [onEdit, onDelete, colors]);

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={11}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 5,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  info: {
    fontSize: 15,
    marginBottom: 2,
  },
   editNameInput: {
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  editInfoInput: {
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
  editActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
  },
  confirmButton: {
    marginRight: 12,
  },
  cancelButton: {},
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    padding: 6,
    marginLeft: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
// Export du composant mémoïsé pour éviter des re-rendus inutiles
export default memo(ProprietaireListComponent);
