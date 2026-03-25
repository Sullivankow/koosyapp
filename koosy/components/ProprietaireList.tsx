
import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Proprietaire } from '../models/proprietaire';
import { useTheme } from '../contexts/ThemeContext';

interface ProprietaireListProps {
  data: Proprietaire[];
  loading?: boolean;
  onDelete?: (id: number) => void;
}

const ProprietaireList: React.FC<ProprietaireListProps> = ({ data, loading, onDelete }) => {
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
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.primary }]}>{item.nom} {item.prenom}</Text>
            <Text style={[styles.info, { color: colors.text }]}>Email : {item.email}</Text>
            <Text style={[styles.info, { color: colors.text }]}>Adresse : {item.adresse}</Text>
            <Text style={[styles.info, { color: colors.text }]}>Téléphone : {item.telephone}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(item.id)} style={{ marginLeft: 12, padding: 6 }}>
              <MaterialCommunityIcons name="trash-can-outline" size={26} color={colors.error || '#d32f2f'} />
            </TouchableOpacity>
          )}
        </View>
      )}
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
