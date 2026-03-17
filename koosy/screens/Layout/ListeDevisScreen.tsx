import { Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { getDevisPdfUrl } from '../../utils/api';
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
import { getSession } from '../../utils/session';

export default function ListeDevisScreen() {
	// Couleurs du thème
	const { colors } = useTheme();
	// Liste des devis
	const [devis, setDevis] = useState<Devis[]>([]);
	// Gestion modale d'ajout de devis
	const { open, modal, lastDevis } = useAddDevisModal([]);
	const screenWidth = Dimensions.get('window').width;
	// Token JWT pour l'authentification PDF
	const [pdfToken, setPdfToken] = useState<string | null>(null);

	// État pour l'aperçu PDF (id du devis à prévisualiser)
	const [previewId, setPreviewId] = useState<number | null>(null);

	// Suppression d'un devis
	const handleDeleteDevis = async (id: number) => {
		try {
			await deleteDevis(id);
			setDevis(devis.filter(d => d.id !== id));
		} catch (e) {
			alert("Erreur lors de la suppression du devis");
		}
	};

	// Ouvre la modale d'aperçu PDF pour le devis sélectionné
	const handlePreviewDevis = (item: Devis) => {
		setPreviewId(item.id);
	};

	useEffect(() => {
		getDevis().then(setDevis).catch(() => setDevis([]));
	}, [lastDevis]);

	// Récupère le token JWT au montage du composant
	useEffect(() => {
		getSession().then(session => {
			setPdfToken(session?.token || null);
		});
	}, []);

	return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				{/* En-tête */}
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

				{/* Liste des devis */}
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

				{/* Bouton flottant pour ajouter un devis */}
				<PlusButton onPress={open} backgroundColor={colors.primary} iconColor={colors.surface} />

				{/* Modale d'ajout de devis */}
				{modal}

				   {/* Modale d'aperçu PDF du devis */}
				   <Modal
					   visible={!!previewId}
					   animationType="slide"
					   onRequestClose={() => setPreviewId(null)}
					   presentationStyle="fullScreen"
				   >
					   <View style={{ flex: 1, backgroundColor: '#fff' }}>
						   <WebView
							   source={{
								   uri: previewId ? getDevisPdfUrl(previewId) : '',
								   headers: pdfToken ? { Authorization: `Bearer ${pdfToken}` } : {},
							   }}
							   style={{ flex: 1, backgroundColor: '#fff' }}
							   originWhitelist={['*']}
							   onLoadStart={syntheticEvent => {
								   const { nativeEvent } = syntheticEvent;
								   console.log('WebView: Début du chargement', nativeEvent.url);
							   }}
							   onLoadEnd={syntheticEvent => {
								   const { nativeEvent } = syntheticEvent;
								   console.log('WebView: Fin du chargement', nativeEvent.url);
							   }}
							   onError={syntheticEvent => {
								   const { nativeEvent } = syntheticEvent;
								   console.log('WebView: Erreur de chargement', nativeEvent);
								   alert('Erreur lors du chargement du PDF : ' + nativeEvent.description);
							   }}
						   />
						   {/* Bouton pour fermer la modale */}
						   <TouchableOpacity onPress={() => setPreviewId(null)} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
							   <MaterialIcons name="close" size={32} color="#000" />
						   </TouchableOpacity>
					   </View>
				   </Modal>
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
