import React, { memo, useState } from 'react';
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
const ProprietaireListComponent: React.FC<ProprietaireListProps> = ({ data, loading, onDelete, onEdit }) => {
  // Identifiant du propriétaire actuellement en mode édition (null si aucun)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Valeurs en cours de modification pour le propriétaire sélectionné
  const [editValues, setEditValues] = useState<Partial<Proprietaire>>({});
  const { colors } = useTheme();

  // Affichage d'un indicateur de chargement lorsque les données sont en cours de récupération
  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
  }

  // Message lorsque la liste est vide
  if (!data.length) {
    return <Text style={[styles.emptyText, { color: colors.text }]}>Aucun propriétaire trouvé.</Text>;
  }

  const keyExtractor = (item: Proprietaire) => item.id.toString();

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        const isEditing = editingId === item.id;

        return (
          <View
            style={[
              styles.card,
              styles.cardRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardContent}>
              {isEditing ? (
                <>
                  {/* Champs éditables pour le nom et le prénom */}
                  <TextInput
                    style={[
                      styles.name,
                      styles.editNameInput,
                      { color: colors.primary, borderColor: colors.border },
                    ]}
                    value={editValues.nom ?? item.nom}
                    onChangeText={v => setEditValues(ev => ({ ...ev, nom: v }))}
                    placeholder="Nom"
                  />
                  <TextInput
                    style={[
                      styles.name,
                      styles.editNameInput,
                      { color: colors.primary, borderColor: colors.border },
                    ]}
                    value={editValues.prenom ?? item.prenom}
                    onChangeText={v => setEditValues(ev => ({ ...ev, prenom: v }))}
                    placeholder="Prénom"
                  />
                  {/* Champs éditables pour les informations de contact */}
                  <TextInput
                    style={[
                      styles.info,
                      styles.editInfoInput,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={editValues.email ?? item.email}
                    onChangeText={v => setEditValues(ev => ({ ...ev, email: v }))}
                    placeholder="Email"
                  />
                  <TextInput
                    style={[
                      styles.info,
                      styles.editInfoInput,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={editValues.adresse ?? item.adresse}
                    onChangeText={v => setEditValues(ev => ({ ...ev, adresse: v }))}
                    placeholder="Adresse"
                  />
                  <TextInput
                    style={[
                      styles.info,
                      styles.editInfoInput,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    value={editValues.telephone ?? item.telephone}
                    onChangeText={v => setEditValues(ev => ({ ...ev, telephone: v }))}
                    placeholder="Téléphone"
                  />

                  {/* Boutons de validation / annulation de l'édition */}
                  <View style={styles.editActionsRow}>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.confirmButton, { backgroundColor: colors.primary }]}
                      onPress={async () => {
                        if (onEdit) {
                          await onEdit(item.id, editValues);
                        }
                        setEditingId(null);
                        setEditValues({});
                      }}
                    >
                      <MaterialCommunityIcons name="check" size={22} color={colors.surface} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.cancelButton, { backgroundColor: colors.error || '#d32f2f' }]}
                      onPress={() => {
                        setEditingId(null);
                        setEditValues({});
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={22} color={colors.surface} />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Affichage en lecture seule des informations du propriétaire */}
                  <Text style={[styles.name, { color: colors.primary }]}>{item.nom} {item.prenom}</Text>
                  <Text style={[styles.info, { color: colors.text }]}>Email : {item.email}</Text>
                  <Text style={[styles.info, { color: colors.text }]}>Adresse : {item.adresse}</Text>
                  <Text style={[styles.info, { color: colors.text }]}>Téléphone : {item.telephone}</Text>
                </>
              )}
            </View>

            <View style={styles.actionsContainer}>
              {/* Bouton pour passer en mode édition */}
              {onEdit && !isEditing && (
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setEditValues({});
                  }}
                  style={styles.actionIconButton}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              )}

              {/* Bouton de suppression du propriétaire */}
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(item.id)}
                  style={styles.actionIconButton}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }}
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
});
// Export du composant mémoïsé pour éviter des re-rendus inutiles
export default memo(ProprietaireListComponent);
