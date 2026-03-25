
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Proprietaire } from '../models/proprietaire';
import { useTheme } from '../contexts/ThemeContext';

interface ProprietaireListProps {
  data: Proprietaire[];
  loading?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, data: Partial<Proprietaire>) => Promise<void>;
}

const ProprietaireList: React.FC<ProprietaireListProps> = ({ data, loading, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Proprietaire>>({});
  const { colors } = useTheme();

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (!data.length) {
    return <Text style={[styles.emptyText, { color: colors.text }]}>Aucun propriétaire trouvé.</Text>;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        const isEditing = editingId === item.id;
        return (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
            <View style={{ flex: 1 }}>
              {isEditing ? (
                <>
                  <TextInput
                    style={[styles.name, { color: colors.primary, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 6 }]}
                    value={editValues.nom ?? item.nom}
                    onChangeText={v => setEditValues(ev => ({ ...ev, nom: v }))}
                    placeholder="Nom"
                  />
                  <TextInput
                    style={[styles.name, { color: colors.primary, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 6 }]}
                    value={editValues.prenom ?? item.prenom}
                    onChangeText={v => setEditValues(ev => ({ ...ev, prenom: v }))}
                    placeholder="Prénom"
                  />
                  <TextInput
                    style={[styles.info, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
                    value={editValues.email ?? item.email}
                    onChangeText={v => setEditValues(ev => ({ ...ev, email: v }))}
                    placeholder="Email"
                  />
                  <TextInput
                    style={[styles.info, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
                    value={editValues.adresse ?? item.adresse}
                    onChangeText={v => setEditValues(ev => ({ ...ev, adresse: v }))}
                    placeholder="Adresse"
                  />
                  <TextInput
                    style={[styles.info, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
                    value={editValues.telephone ?? item.telephone}
                    onChangeText={v => setEditValues(ev => ({ ...ev, telephone: v }))}
                    placeholder="Téléphone"
                  />
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <TouchableOpacity
                      style={{ marginRight: 12, padding: 6, backgroundColor: colors.primary, borderRadius: 6 }}
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
                      style={{ padding: 6, backgroundColor: colors.error || '#d32f2f', borderRadius: 6 }}
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
                  <Text style={[styles.name, { color: colors.primary }]}>{item.nom} {item.prenom}</Text>
                  <Text style={[styles.info, { color: colors.text }]}>Email : {item.email}</Text>
                  <Text style={[styles.info, { color: colors.text }]}>Adresse : {item.adresse}</Text>
                  <Text style={[styles.info, { color: colors.text }]}>Téléphone : {item.telephone}</Text>
                </>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onEdit && !isEditing && (
                <TouchableOpacity onPress={() => { setEditingId(item.id); setEditValues({}); }} style={{ marginRight: 8, padding: 6 }}>
                  <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={() => onDelete(item.id)} style={{ marginLeft: 0, padding: 6 }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.error || '#d32f2f'} />
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  info: {
    fontSize: 15,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default ProprietaireList;
