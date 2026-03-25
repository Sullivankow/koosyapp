import React, { useState, useMemo } from 'react';
import { StatusBar } from 'react-native';
// import supprimé car déjà présent plus bas
import { View, Text, TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useAddDevisModal } from '../../hooks/useAddDevisModal';
import { useEntreprises } from '../../hooks/useEntreprises';
import { useTheme } from '../../contexts/ThemeContext';
// SafeAreaView supprimé pour un rendu identique à BiensScreen
import HeaderWithAddButton from '../../ui/HeaderWithAddButton';
import { Dimensions } from 'react-native';
import { exportPdfToPhone } from '../../utils/pdfExport';
import { useDevisManager } from '../../hooks/useDevisManager';
import { DevisList } from '../../components/DevisList';
import { getDevisPdfUrl } from '../../utils/api';
import useDevisSearchSort from '../../hooks/useDevisSearchSort';
import SearchBar from '../../ui/SearchBar';

import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function ListeDevisScreen() {
    // Récupération des entreprises de l'utilisateur
    const entreprises = useEntreprises();
    // Gestion modale d'ajout de devis avec la vraie liste d'entreprises (doit être avant useDevisManager)
    const { open, modal, lastDevis } = useAddDevisModal(entreprises);
    // Gestion centralisée des devis, token et aperçu via hook personnalisé
    // On passe lastDevis pour forcer le rafraîchissement après création
    const { devis, setDevis, pdfToken, setPdfToken, previewId, setPreviewId, handleDeleteDevis, handlePreviewDevis } = useDevisManager(lastDevis);
    // Couleurs du thème
    const { colors } = useTheme();
    const screenWidth = Dimensions.get('window').width;

	// Recherche locale
	const [search, setSearch] = useState('');

	// Filtrage local par numéro ou montant
	const filteredDevis = useMemo(() =>
		devis.filter(d =>
			(d.numero && d.numero.toLowerCase().includes(search.toLowerCase())) ||
			(d.montantTTC !== undefined && d.montantTTC !== null && d.montantTTC.toString().includes(search))
		),
		[devis, search]
	);

	// Tri via hook personnalisé
	const { sortOrder, setSortOrder, sortedDevis } = useDevisSearchSort(filteredDevis);

	// Fonction pour exporter le PDF sur le téléphone (utilitaire extrait)
	const handleExportPdf = async () => {
		if (!previewId) return;
		const pdfUrl = getDevisPdfUrl(previewId);
		await exportPdfToPhone(pdfUrl, `devis_${previewId}.pdf`, pdfToken || undefined);
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.surface }}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
			{/* En-tête réutilisable déplacé à l'intérieur du SafeAreaView */}
			<HeaderWithAddButton
				title="Mes devis"
				onAdd={open}
				colors={colors}
			/>


			{/* Barre de recherche et bouton de tri */}
			<View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
				<View style={{ flex: 1 }}>
					<SearchBar
						value={search}
						onChangeText={setSearch}
						placeholder="Rechercher un devis..."
						style={{ backgroundColor: 'transparent' }}
					/>
				</View>
				<TouchableOpacity
					style={{ marginLeft: 8, padding: 8, backgroundColor: colors.primary, borderRadius: 8 }}
					onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
				>
					<MaterialCommunityIcons
						name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
						size={24}
						color={colors.surface}
					/>
				</TouchableOpacity>
			</View>

			{/* Liste des devis (extrait dans un composant) */}
			<DevisList devis={sortedDevis} colors={colors} handlePreviewDevis={handlePreviewDevis} handleDeleteDevis={handleDeleteDevis} />

			{/* PlusButton supprimé, remplacé par HeaderWithAddButton */}

			{/* Modale d'ajout de devis */}
			{modal}

			{/* Modale d'aperçu PDF du devis */}
			<Modal
				visible={!!previewId}
				animationType="slide"
				onRequestClose={() => setPreviewId(null)}
				presentationStyle="fullScreen"
			>
				{/* WebView pour afficher le PDF du devis avec logs de debug et header Authorization */}
				<WebView
					source={{
						uri: previewId ? getDevisPdfUrl(previewId) : '',
						headers: pdfToken ? { Authorization: `Bearer ${pdfToken}` } : {},
					}}
					style={{ flex: 1 }}
					originWhitelist={['*']}
					onLoadStart={syntheticEvent => {
						// Handler sans log
					}}
					onLoadEnd={syntheticEvent => {
						// Handler sans log
					}}
					onError={syntheticEvent => {
						const { nativeEvent } = syntheticEvent;
						alert('Erreur lors du chargement du PDF : ' + nativeEvent.description);
					}}
				/>
				{/* Bouton pour exporter le PDF en bas à droite */}
				<TouchableOpacity onPress={handleExportPdf} style={{ position: 'absolute', bottom: 30, right: 30, zIndex: 10, backgroundColor: colors.primary, borderRadius: 30, padding: 16, elevation: 4 }}>
					<MaterialIcons name="file-upload" size={32} color={colors.surface} />
				</TouchableOpacity>
				{/* Bouton pour fermer la modale */}
				<TouchableOpacity onPress={() => setPreviewId(null)} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
					<MaterialIcons name="close" size={32} color="#000" />
				</TouchableOpacity>
				</Modal>
		</View>
	);
}

