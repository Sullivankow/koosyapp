import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getProprietaires } from '../utils/api';
import type { Proprietaire } from '../models/proprietaire';
import { useTheme } from '../contexts/ThemeContext';

const ProprietaireList: React.FC = () => {
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    getProprietaires()
      .then(setProprietaires)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (!proprietaires.length) {
    return <Text style={[styles.emptyText, { color: colors.text }]}>Aucun propriétaire trouvé.</Text>;
  }

  return (
    <FlatList
      data={proprietaires}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.name, { color: colors.primary }]}>{item.nom} {item.prenom}</Text>
          <Text style={[styles.info, { color: colors.text }]}>Email : {item.email}</Text>
          <Text style={[styles.info, { color: colors.text }]}>Adresse : {item.adresse}</Text>
          <Text style={[styles.info, { color: colors.text }]}>Téléphone : {item.telephone}</Text>
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
