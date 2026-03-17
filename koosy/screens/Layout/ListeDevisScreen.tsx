import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getDevis } from '../../utils/api';
import { deleteDevis } from '../../utils/api';
import type { Devis } from '../../models/models';
import { useAddDevisModal } from '../../hooks/useAddDevisModal';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlusButton from '../../components/PlusButton';
import { Dimensions } from 'react-native';

export default function ListeDevisScreen() {
		const { colors } = useTheme();
		const [devis, setDevis] = useState<Devis[]>([]);
		const { open, modal, lastDevis } = useAddDevisModal([]);
		const screenWidth = Dimensions.get('window').width;

		const handleDeleteDevis = async (id: number) => {
			try {
				await deleteDevis(id);
				setDevis(devis.filter(d => d.id !== id));
			} catch (e) {
				alert("Erreur lors de la suppression du devis");
			}
		};

		const handlePreviewDevis = (item: Devis) => {
			// À remplacer par la navigation ou l'affichage d'une modale d'aperçu
			alert(`Aperçu du devis n°${item.numero || item.id}`);
		};

	useEffect(() => {
		getDevis().then(setDevis).catch(() => setDevis([]));
	}, [lastDevis]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
			<View style={{
				height: 60,
				backgroundColor: colors.primary,
				justifyContent: 'center',
				alignItems: 'center',
				borderBottomWidth: 1,
				borderBottomColor: colors.border,
				width: screenWidth,
				elevation: 2,
				shadowColor: colors.shadow,
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.12,
				shadowRadius: 2,
			}}>
				<Text style={{ fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Mes devis</Text>
			</View>
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
						   <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
							   <TouchableOpacity onPress={() => handlePreviewDevis(item)} style={{ marginHorizontal: 4 }}>
								   <Ionicons name="eye-outline" size={24} color={colors.primary} />
							   </TouchableOpacity>
							   <TouchableOpacity onPress={() => handleDeleteDevis(item.id)} style={{ marginHorizontal: 4 }}>
								   <MaterialIcons name="delete-outline" size={24} color="#d32f2f" />
							   </TouchableOpacity>
						   </View>
					   </View>
				   )}
				ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Aucun devis pour l'instant.</Text>}
			/>
			   <PlusButton onPress={open} backgroundColor={colors.primary} iconColor={colors.surface} />
			{modal}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	devisItem: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	devisTitle: {
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 4,
	},
	devisDate: {
		color: '#666',
		marginBottom: 2,
	},
	devisMontant: {
		color: '#333',
		fontWeight: '600',
	},
	fab: {
		position: 'absolute',
		bottom: 30,
		right: 30,
		backgroundColor: '#2196F3',
		borderRadius: 30,
		padding: 16,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
});
