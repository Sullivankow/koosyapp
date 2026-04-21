
import React, { useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Image } from 'react-native';
import BienCard from '../../components/cards/biens/BienCard';
// Ajoute ici les autres imports nécessaires (hooks, contextes, styles, etc.)

const BiensScreen = () => {
	// États minimaux pour la démo (à adapter selon ton projet)
	const [biens, setBiens] = useState<any[]>([]); // À remplacer par useBiens ou autre hook réel
	const [colors] = useState({
		surface: '#fff',
		primary: '#007bff',
		secondary: '#6c757d',
		accent: '#ffc107',
		error: '#dc3545',
		text: '#212529',
		textSecondary: '#6c757d',
		background: '#f8f9fa',
		border: '#dee2e6',
	});
	const [photoModalVisible, setPhotoModalVisible] = useState(false);
	const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
	const listRef = useRef(null);

	// Dummy pour la démo
	const handleEditBienInline = () => {};
	const handleSupprimerBien = () => {};
	const openStatusModal = () => {};
	const handlePhotoPress = (photo: any) => { setSelectedPhoto(photo); setPhotoModalVisible(true); };
	const formatDateFR = (dateStr?: string) => dateStr || '';
	const totalPerBienMap: Record<string, number> = {};

	// Optimisation FlatList
	const renderItem = useCallback(
		({ item }: { item: any }) => (
			<BienCard
				bien={item}
				colors={colors}
				onEdit={handleEditBienInline}
				onDelete={handleSupprimerBien}
				onStatus={openStatusModal}
				onPhotoPress={handlePhotoPress}
				formatDateFR={formatDateFR}
				totalPrestationPercu={totalPerBienMap[String(item.id)] ?? 0}
			/>
		),
		[colors, handleEditBienInline, handleSupprimerBien, openStatusModal, handlePhotoPress, formatDateFR, totalPerBienMap]
	);

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<FlatList
				ref={listRef}
				data={biens}
				keyExtractor={item => String(item.id)}
				renderItem={renderItem}
				contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
				getItemLayout={(_, index) => ({ length: 340, offset: 340 * index, index })}
				initialNumToRender={5}
				maxToRenderPerBatch={8}
				windowSize={7}
				removeClippedSubviews={true}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Aucun bien trouvé.</Text>}
			/>
			<Modal visible={photoModalVisible} transparent animationType="fade">
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
					<TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 2 }} onPress={() => setPhotoModalVisible(false)}>
						<Text style={{ color: '#fff', fontSize: 32 }}>×</Text>
					</TouchableOpacity>
					{selectedPhoto && (
						<Image source={selectedPhoto} style={{ width: 300, height: 300, resizeMode: 'contain' }} />
					)}
				</View>
			</Modal>
		</View>
	);
};

export default BiensScreen;













