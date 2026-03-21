import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { Facture } from '../models/models';

/**
 * Composant pour afficher la liste des factures avec actions d'aperçu et de suppression.
 * @param factures Liste des factures à afficher
 * @param colors Couleurs du thème
 * @param handlePreviewFacture Fonction pour ouvrir l'aperçu PDF
 * @param handleDeleteFacture Fonction pour supprimer une facture
 */
export function FactureList({ factures, colors, handlePreviewFacture, handleDeleteFacture }: {
	factures: Facture[];
	colors: any;
	handlePreviewFacture: (item: Facture) => void;
	handleDeleteFacture: (id: number) => void;
}) {
	return (
		<FlatList
			data={factures}
			keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
			renderItem={({ item }) => (
				<View style={[styles.factureItem, { backgroundColor: colors.surface, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
					<View style={{ flex: 1 }}>
						<Text style={[styles.factureTitle, { color: colors.primary }]}>{item.numero || `Facture #${item.id}`}</Text>
						<Text style={[styles.factureDate, { color: colors.textSecondary }]}>Date échéance : {item.dateEcheance ? new Date(item.dateEcheance).toLocaleDateString('fr-FR') : '-'}</Text>
						<Text style={[styles.factureMontant, { color: colors.text }]}>{'Montant TTC : '}{item.montantTTC !== undefined && item.montantTTC !== null ? Number(item.montantTTC).toFixed(2) : '0.00'} €</Text>
					</View>
					{/* Actions : Aperçu et suppression */}
					<View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
						{/* Icône œil pour aperçu PDF */}
						<TouchableOpacity onPress={() => handlePreviewFacture(item)} style={{ marginHorizontal: 4 }}>
							<Ionicons name="eye-outline" size={24} color={colors.primary} />
						</TouchableOpacity>
						{/* Icône corbeille pour suppression */}
						<TouchableOpacity onPress={() => handleDeleteFacture(item.id)} style={{ marginHorizontal: 4 }}>
							<MaterialIcons name="delete-outline" size={24} color="#d32f2f" />
						</TouchableOpacity>
					</View>
				</View>
			)}
			ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Aucune facture pour l'instant.</Text>}
		/>
	);
}

const styles = StyleSheet.create({
	factureItem: {
		padding: 16,
		borderBottomWidth: 1,
	},
	factureTitle: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	factureDate: {
		fontSize: 14,
		marginTop: 4,
	},
	factureMontant: {
		fontSize: 16,
		marginTop: 4,
		fontWeight: '600',
	},
});
