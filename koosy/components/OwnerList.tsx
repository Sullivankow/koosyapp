import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import OwnerCard from './OwnerCard';
import type { Proprietaire } from '../models/models';
import { useTheme } from '../contexts/ThemeContext';

type OwnerListProps = {
  data: Proprietaire[];
  loading?: boolean;
  ListHeaderComponent?: React.ReactElement;
  onOpenEdit?: (owner: Proprietaire) => void;
  onEdit?: (id: number, data?: Partial<Proprietaire>) => Promise<void> | void;
  onDelete?: (id: number) => void;
};

function OwnerList({ data, loading, ListHeaderComponent, onOpenEdit, onEdit, onDelete }: OwnerListProps) {
  const { colors } = useTheme();
  const keyExtractor = useCallback((item: Proprietaire) => item.id.toString(), []);

  // renderItem est memoise pour que FlatList ne redessine pas toutes les lignes
  // quand seule la recherche, le tri ou une modale change.
  const renderItem = useCallback(({ item }: { item: Proprietaire }) => (
    <OwnerCard
      owner={item}
      onPress={() => onOpenEdit?.(item)}
      onEdit={(id) => onEdit?.(id)}
      onDelete={onDelete}
    />
  ), [onOpenEdit, onEdit, onDelete]);

  const emptyState = !loading ? (
    <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <MaterialCommunityIcons name="account-search-outline" size={30} color={colors.primary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun proprietaire trouve</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Essayez une autre recherche ou ajoutez un nouveau contact.</Text>
    </View>
  ) : null;

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={emptyState}
      ListFooterComponent={loading ? (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      contentContainerStyle={styles.container}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 34,
  },
  emptyState: {
    marginHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: 18,
  },
});

export default React.memo(OwnerList);
