import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ListRenderItem } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { Devis } from '../models/models';

// Typage des couleurs utilisées dans le thème
type ThemeColors = {
  primary: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
};

// Props attendues par le composant DevisList
type DevisListProps = {
  devis: Devis[];
  colors: ThemeColors;
  handlePreviewDevis: (item: Devis) => void;
  handleDeleteDevis: (id: number | undefined) => void;
};

/**
 * Composant pour afficher la liste des devis avec actions d'aperçu PDF et de suppression.
 */
export const DevisList = memo(function DevisList({ devis, colors, handlePreviewDevis, handleDeleteDevis }: DevisListProps) {
  // Boîte de dialogue de confirmation avant suppression d'un devis
  const confirmDeleteDevis = useCallback(
    (id: number | undefined) => {
      Alert.alert(
        'Confirmation',
        'Voulez-vous vraiment supprimer ce devis ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: () => handleDeleteDevis(id) },
        ]
      );
    },
    [handleDeleteDevis]
  );

  // Rendu d'un élément de la liste (un devis)
  const renderItem: ListRenderItem<Devis> = ({ item }) => {
    // Titre affiché : numéro de devis ou fallback avec l'ID
    const displayTitle = item.numero || `Devis #${item.id}`;
    // Date de validité formatée en français ou tiret si absente
    const displayDate = item.dateValidite
      ? new Date(item.dateValidite).toLocaleDateString('fr-FR')
      : '-';
    // Montant TTC formaté sur 2 décimales, avec valeur par défaut
    const montantTTC =
      item.montantTTC !== undefined && item.montantTTC !== null
        ? Number(item.montantTTC).toFixed(2)
        : '0.00';

    return (
      <View
        style={[
          styles.devisItem,
          {
            backgroundColor: colors.primary,
            borderBottomColor: colors.primary,
          },
        ]}
      >
        <View style={styles.devisContent}>
          <Text style={[styles.devisTitle, { color: colors.surface }]}>{displayTitle}</Text>
          <Text style={[styles.devisDate, { color: colors.surface }]}>Date validité : {displayDate}</Text>
          <Text style={[styles.devisMontant, { color: colors.surface }]}>
            Montant TTC : {montantTTC} €
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {/* Bouton pour ouvrir l'aperçu PDF du devis */}
          <TouchableOpacity
            onPress={() => handlePreviewDevis(item)}
            style={styles.actionButton}
          >
            <Ionicons name="eye-outline" size={24} color={colors.surface} />
          </TouchableOpacity>

          {/* Bouton pour demander la suppression du devis */}
          <TouchableOpacity
            onPress={() => confirmDeleteDevis(item.id)}
            style={styles.actionButton}
          >
            <MaterialIcons name="delete-outline" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Génération d'une clé stable pour chaque devis dans la FlatList
  const keyExtractor = (item: Devis, index: number) =>
    item.id?.toString() ?? item.numero ?? index.toString();

  // Composant affiché lorsque la liste est vide
  const ListEmptyComponent = (
    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun devis pour l'instant.</Text>
  );

  return (
    <FlatList
      data={devis}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
});

const styles = StyleSheet.create({
  devisItem: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devisContent: {
    flex: 1,
  },
  devisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  devisDate: {
    fontSize: 14,
    marginTop: 4,
  },
  devisMontant: {
    fontSize: 16,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },
});
