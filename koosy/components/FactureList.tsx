import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ListRenderItem } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { Facture } from '../models/models';

// Typage des couleurs utilisées dans le thème
type ThemeColors = {
	primary: string;
	surface: string;
	border: string;
	text: string;
	textSecondary: string;
};

// Props attendues par le composant FactureList
type FactureListProps = {
	factures: Facture[];
	colors: ThemeColors;
	handlePreviewFacture: (item: Facture) => void;
	handleDeleteFacture: (id: number | undefined) => void;
};

/**
 * Composant pour afficher la liste des factures avec actions d'aperçu PDF et de suppression.
 */
export const FactureList = memo(function FactureList({ factures, colors, handlePreviewFacture, handleDeleteFacture }: FactureListProps) {
	// Boîte de dialogue de confirmation avant suppression d'une facture
	const confirmDeleteFacture = useCallback(
		(id: number | undefined) => {
			Alert.alert(
				'Confirmation',
				'Voulez-vous vraiment supprimer cette facture ?',
				[
					{ text: 'Annuler', style: 'cancel' },
					{ text: 'Supprimer', style: 'destructive', onPress: () => handleDeleteFacture(id) },
				]
			);
		},
		[handleDeleteFacture]
	);

	// Rendu d'un élément de la liste (une facture)
	const renderItem: ListRenderItem<Facture> = ({ item }) => {
		// Titre affiché : numéro de facture ou fallback avec l'ID
		const displayTitle = item.numero || `Facture #${item.id}`;
		// Date d'échéance formatée en français ou tiret si absente
		const displayDate = item.dateEcheance
			? new Date(item.dateEcheance).toLocaleDateString('fr-FR')
			: '-';
		// Montant TTC formaté sur 2 décimales, avec valeur par défaut
		const montantTTC =
			item.montantTTC !== undefined && item.montantTTC !== null
				? Number(item.montantTTC).toFixed(2)
				: '0.00';

		return (
			<View
				style={[
					styles.factureItem,
					{
						backgroundColor: colors.primary,
						borderBottomColor: colors.primary,
					},
				]}
			>
				<View style={styles.factureContent}>
					  <Text style={[styles.factureTitle, { color: colors.surface }]}>{displayTitle}</Text>
					  <Text style={[styles.factureDate, { color: colors.surface }]}>Date échéance : {displayDate}</Text>
					  <Text style={[styles.factureMontant, { color: colors.surface }]}>
						Montant TTC : {montantTTC} €
					</Text>
				</View>

				<View style={styles.actionsContainer}>
					{/* Bouton pour ouvrir l'aperçu PDF de la facture */}
					<TouchableOpacity
						onPress={() => handlePreviewFacture(item)}
						style={styles.actionButton}
					>
						<Ionicons name="eye-outline" size={24} color={colors.surface} />
					</TouchableOpacity>

					{/* Bouton pour demander la suppression de la facture */}
					<TouchableOpacity
						onPress={() => confirmDeleteFacture(item.id)}
						style={styles.actionButton}
					>
						<MaterialIcons name="delete-outline" size={24} color="#d32f2f" />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	// Génération d'une clé stable pour chaque facture dans la FlatList
	const keyExtractor = (item: Facture, index: number) =>
		item.id?.toString() ?? item.numero ?? index.toString();

	// Composant affiché lorsque la liste est vide
	const ListEmptyComponent = (
		<Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune facture pour l'instant.</Text>
	);

	return (
		<FlatList
			data={factures}
			keyExtractor={keyExtractor}
			renderItem={renderItem}
			ListEmptyComponent={ListEmptyComponent}
		/>
	);
});

const styles = StyleSheet.create({
	factureItem: {
		padding: 16,
		borderBottomWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	factureContent: {
		flex: 1,
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
