import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { Devis } from '../models/models';

/**
 * Composant pour afficher la liste des devis avec actions d'aperçu et de suppression.
 * @param devis Liste des devis à afficher
 * @param colors Couleurs du thème
 * @param handlePreviewDevis Fonction pour ouvrir l'aperçu PDF
 * @param handleDeleteDevis Fonction pour supprimer un devis
 */
export function DevisList({ devis, colors, handlePreviewDevis, handleDeleteDevis }: {
  devis: Devis[];
  colors: any;
  handlePreviewDevis: (item: Devis) => void;
  handleDeleteDevis: (id: number) => void;
}) {
  return (
    <FlatList
      data={devis}
      keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
      renderItem={({ item }) => (
        <View style={[styles.devisItem, { backgroundColor: colors.surface, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
          <View style={{ flex: 1 }}>
            <Text style={[styles.devisTitle, { color: colors.primary }]}>{item.numero || `Devis #${item.id}`}</Text>
            <Text style={[styles.devisDate, { color: colors.textSecondary }]}>Date validité : {item.dateValidite ? new Date(item.dateValidite).toLocaleDateString('fr-FR') : '-'}</Text>
            <Text style={[styles.devisMontant, { color: colors.text }]}>{'Montant TTC : '}{item.montantTTC !== undefined && item.montantTTC !== null ? Number(item.montantTTC).toFixed(2) : '0.00'} €</Text>
          </View>
          {/* Actions : Aperçu et suppression */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            {/* Icône œil pour aperçu PDF */}
            <TouchableOpacity onPress={() => handlePreviewDevis(item)} style={{ marginHorizontal: 4 }}>
              <Ionicons name="eye-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            {/* Icône corbeille pour suppression */}
            <TouchableOpacity onPress={() => handleDeleteDevis(item.id)} style={{ marginHorizontal: 4 }}>
              <MaterialIcons name="delete-outline" size={24} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Aucun devis pour l'instant.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  devisItem: {
    padding: 16,
    borderBottomWidth: 1,
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
});
