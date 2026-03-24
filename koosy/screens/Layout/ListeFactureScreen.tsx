import React, { useState, useMemo } from 'react';
import { StatusBar } from 'react-native';
// import supprimé car déjà présent plus bas
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
// SafeAreaView supprimé pour un rendu identique à BiensScreen
import { Dimensions } from 'react-native';
import { useFactureManager } from '../../hooks/useFactureManager';
import { getFacturePdfUrl } from '../../utils/api';
import { exportPdfToPhone } from '../../utils/pdfExport';
import { useEntreprises } from '../../hooks/useEntreprises';
import { useAddFactureModal } from '../../hooks/useAddFactureModal';
import useFactureSearchSort from '../../hooks/useFactureSearchSort';
import { FactureList } from '../../components/FactureList';
import SearchBar from '../../components/ui/SearchBar';
import HeaderWithAddButton from '../../components/ui/HeaderWithAddButton';




// Écran principal de la liste des factures
export default function ListeFactureScreen() {
	// Récupération des entreprises de l'utilisateur
	const entreprises = useEntreprises();
	// Hook pour gérer la modale d'ajout de facture (doit être avant useFactureManager)
	const { open: openAddFacture, modal: addFactureModal, lastFacture } = useAddFactureModal(entreprises);
	// Gestion centralisée des factures, token et aperçu via hook personnalisé
	// On passe lastFacture pour forcer le rafraîchissement après création
	const { factures, pdfToken, previewId, setPreviewId, handleDeleteFacture, handlePreviewFacture } = useFactureManager(lastFacture);
	// Couleurs du thème
	const { colors } = useTheme();
	const screenWidth = Dimensions.get('window').width;

	// Recherche locale
	const [search, setSearch] = useState('');

	// Filtrage local par numéro ou montant
	const filteredFactures = useMemo(() =>
		factures.filter(f =>
			(f.numero && f.numero.toLowerCase().includes(search.toLowerCase())) ||
			(f.montantTTC !== undefined && f.montantTTC !== null && f.montantTTC.toString().includes(search))
		),
		[factures, search]
	);

	// Tri via hook personnalisé
	const { sortOrder, setSortOrder, sortedFactures } = useFactureSearchSort(filteredFactures);

	// Fonction pour exporter le PDF sur le téléphone (identique à devis)
	const handleExportPdf = async () => {
		if (!previewId) return;
		const pdfUrl = getFacturePdfUrl(previewId);
		await exportPdfToPhone(pdfUrl, `facture_${previewId}.pdf`, pdfToken || undefined);
	};

	 return (
		 <View style={{ flex: 1, backgroundColor: colors.surface }}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
			 {/* En-tête réutilisable déplacé à l'intérieur du SafeAreaView */}
			 <HeaderWithAddButton
				title="Mes factures"
				onAdd={openAddFacture}
				colors={colors}
			/>

			 {/* Barre de recherche et bouton de tri */}
			 <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, marginTop: 18 }}>
				 <View style={{ flex: 1 }}>
					 <SearchBar
						 value={search}
						 onChangeText={setSearch}
						 placeholder="Rechercher une facture..."
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

			 {/* Liste des factures (extrait dans un composant) */}
			 <FactureList factures={sortedFactures} colors={colors} handlePreviewFacture={handlePreviewFacture} handleDeleteFacture={handleDeleteFacture} />

			 {/* PlusButton supprimé, remplacé par HeaderWithAddButton */}
			 {/* Modale de création de facture */}
			 {addFactureModal}

			 {/* Modale d'aperçu PDF de la facture */}
			 <Modal
				 visible={!!previewId}
				 animationType="slide"
				 onRequestClose={() => setPreviewId(null)}
				 presentationStyle="fullScreen"
			 >
				 {/* WebView pour afficher le PDF de la facture avec header Authorization */}
				 <WebView
					 source={{
						 uri: previewId ? getFacturePdfUrl(previewId) : '',
						 headers: pdfToken ? { Authorization: `Bearer ${pdfToken}` } : {},
					 }}
					 style={{ flex: 1 }}
					 originWhitelist={['*']}
					 onError={syntheticEvent => {
						 const { nativeEvent } = syntheticEvent;
						 alert('Erreur lors du chargement du PDF : ' + nativeEvent.description);
					 }}
				 />
				 {/* Bouton pour exporter le PDF en bas à droite (optionnel) */}
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
