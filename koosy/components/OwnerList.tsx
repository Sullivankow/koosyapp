import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import OwnerCard from './OwnerCard';
import type { Proprietaire } from '../models/models';

type OwnerListProps = {
  data: Proprietaire[];
  loading?: boolean;
  onOpenEdit?: (owner: Proprietaire) => void;
  onEdit?: (id: number, data?: Partial<Proprietaire>) => Promise<void> | void;
  onDelete?: (id: number) => void;
};

export default function OwnerList({ data, onOpenEdit, onEdit, onDelete }: OwnerListProps) {
  const keyExtractor = useCallback((item: Proprietaire) => item.id.toString(), []);

  const renderItem = useCallback(({ item }: { item: Proprietaire }) => (
    <OwnerCard owner={item} onPress={() => onOpenEdit?.(item)} onEdit={(id) => onEdit?.(id)} onDelete={onDelete} />
  ), [onOpenEdit, onEdit, onDelete]);

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={11}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
