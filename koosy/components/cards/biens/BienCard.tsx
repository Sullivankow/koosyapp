import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProprioBox from './ProprioBox';
import { styles } from '../../../screens/Layout/styles/BienScreen.styles';
import type { Bien } from '../../../models/models';
import PrestationTimeline from './PrestationTimeline';
import TacheTimeline from './TacheTimeline';
import ReservationList from './ReservationList';
import { Carrousel } from '../../../ui/Carrousel';
import ButtonAction from '../../../ui/ButtonAction';

interface BienCardProps {
	bien: Bien & { photos?: (string | { uri: string })[] };
	totalPrestationPercu: number;
	colors: {
		surface: string;
		primary: string;
		secondary: string;
		accent: string;
		error: string;
		text: string;
		textSecondary: string;
	};
	onEdit: (bien: Bien) => void;
	onDelete: (bienId: string) => void;
	onStatus: (bien: Bien) => void;
	onPhotoPress: (photo: string) => void;
	formatDateFR: (dateStr?: string) => string;
}

function BienCard(props: BienCardProps) {
	const { bien, totalPrestationPercu, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR } = props;
	const [isEditing, setIsEditing] = useState(false);
	const [detailsModalVisible, setDetailsModalVisible] = useState(false);
	const [editValues, setEditValues] = useState({
		nom: bien.nom || '',
		adresse: bien.adresse || '',
		type: bien.type || '',
		superficie: bien.superficie ? String(bien.superficie) : '',
		pieces: bien.pieces ? String(bien.pieces) : '',
		equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
	});
	const [localProprio, setLocalProprio] = useState(bien.proprio);
	const handleChange = (field: keyof typeof editValues, value: string) => {
		setEditValues(prev => ({ ...prev, [field]: value }));
	};


	const statutColor = useMemo(() => {
		if (bien.statut === 'disponible') return '#15803D';
		if (bien.statut === 'occupé') return '#B91C1C';
		return colors.accent;
	}, [bien.statut, colors.accent]);
	const statutBg = useMemo(() => {
		if (bien.statut === 'disponible') return '#DCFCE7';
		if (bien.statut === 'occupé') return '#FEE2E2';
		return '#FEF3C7';
	}, [bien.statut]);

	const handleEditPress = () => {
		if (isEditing) {
			const payload: any = {
				nom: editValues.nom,
				adresse: editValues.adresse,
				type: editValues.type,
				superficie: Number(editValues.superficie),
				pieces: Number(editValues.pieces),
				equipements: editValues.equipements.split(',').map((e: string) => e.trim()).filter(Boolean),
			};
			if (bien.statut) payload.statut = bien.statut;
			if (bien.lat) payload.lat = bien.lat;
			if (bien.lng) payload.lng = bien.lng;
			onEdit({ id: bien.id, ...payload });
			setIsEditing(false);
		} else {
			setIsEditing(true);
		}
	};

	const handleCancelEdit = () => {
		setEditValues({
			nom: bien.nom || '',
			adresse: bien.adresse || '',
			type: bien.type || '',
			superficie: bien.superficie ? String(bien.superficie) : '',
			pieces: bien.pieces ? String(bien.pieces) : '',
			equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
		});
		setIsEditing(false);
	};

	return (
		<View style={[styles.card, { backgroundColor: colors.surface }]}> 
			<View style={styles.denseHeaderRow}>
				<View style={styles.denseHeaderLeft}>
					{isEditing ? (
						<TextInput
							style={{ fontSize: 19, fontWeight: 'bold', color: colors.primary, marginBottom: 2, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }}
							value={editValues.nom}
							onChangeText={v => handleChange('nom', v)}
							placeholder="Nom du bien"
						/>
					) : (
						<Text style={{ fontSize: 19, fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>{bien.nom || 'Sans nom'}</Text>
					)}
					<Text style={{ fontSize: 13, color: colors.textSecondary }}>
						Créé le {bien.dateCreation ? formatDateFR(bien.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() => onStatus(bien)}
					disabled={isEditing}
					style={[styles.statusPill, { backgroundColor: statutBg }]}
				>
					<Text style={{ fontSize: 12, fontWeight: '700', color: statutColor }}>{bien.statut || '-'}</Text>
				</TouchableOpacity>
			</View>

			{Array.isArray(bien.photos) && bien.photos.length > 0 && (
				<Carrousel
					photos={bien.photos}
					onPhotoPress={onPhotoPress}
					style={styles.carouselDense}
					photoStyle={styles.carouselPhotoDense}
				/>
			)}

			<View style={styles.infoGridDense}>
				<View style={styles.infoCol}>
					<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
					{isEditing ? (
						<TextInput
							style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
							value={editValues.type}
							onChangeText={v => handleChange('type', v)}
							placeholder="Type"
						/>
					) : (
						<Text style={[styles.infoValue, { color: colors.text }]}>{bien.type || '-'}</Text>
					)}
				</View>
				<View style={styles.infoCol}>
					<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Superficie</Text>
					{isEditing ? (
						<TextInput
							style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
							value={editValues.superficie}
							onChangeText={v => handleChange('superficie', v)}
							placeholder="Superficie (m²)"
							keyboardType="numeric"
						/>
					) : (
						<Text style={[styles.infoValue, { color: colors.text }]}>{bien.superficie ? bien.superficie + ' m²' : '-'}</Text>
					)}
				</View>
				<View style={styles.infoCol}>
					<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pièces</Text>
					{isEditing ? (
						<TextInput
							style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
							value={editValues.pieces}
							onChangeText={v => handleChange('pieces', v)}
							placeholder="Nb pièces"
							keyboardType="numeric"
						/>
					) : (
						<Text style={[styles.infoValue, { color: colors.text }]}>{bien.pieces || '-'}</Text>
					)}
				</View>
			</View>

			<View style={styles.rowDenseBetween}>
				<View style={{ flex: 1, marginRight: 10 }}>
					<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Adresse</Text>
					{isEditing ? (
						<TextInput
							style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
							value={editValues.adresse}
							onChangeText={v => handleChange('adresse', v)}
							placeholder="Adresse"
						/>
					) : (
						<Text numberOfLines={1} style={[styles.infoValue, { color: colors.text }]}>{bien.adresse || '-'}</Text>
					)}
				</View>
				<TouchableOpacity onPress={() => setDetailsModalVisible(true)} style={[styles.detailsToggle, { borderColor: colors.primary }]}> 
					<Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
						Voir détails
					</Text>
				</TouchableOpacity>
			</View>

			<View style={{ marginTop: 8 }}>
				<Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: 12 }}>
					Propriétaire: {localProprio?.nom || localProprio?.email || 'Non renseigné'}
				</Text>
			</View>
			{/* Actions principales */}
			<View style={styles.floatingActions}>
				<ButtonAction
					isEditing={isEditing}
					colors={colors}
					onEditPress={handleEditPress}
					onCancelEdit={handleCancelEdit}
					onDelete={onDelete}
					bienId={bien.id}
				/>
			</View>

			<Modal
				visible={detailsModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setDetailsModalVisible(false)}
			>
				<View style={styles.detailsModalOverlay}>
					<View style={[styles.detailsModalCard, { backgroundColor: colors.surface }]}> 
						<View style={styles.detailsModalHeader}>
							<Text style={[styles.detailsModalTitle, { color: colors.text }]}>Détails du bien</Text>
							<TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
								<MaterialCommunityIcons name="close" size={24} color={colors.text} />
							</TouchableOpacity>
						</View>

						<ScrollView contentContainerStyle={styles.detailsModalBody}>
							<View>
								<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Propriétaire</Text>
								<ProprioBox proprio={localProprio} colors={colors} styles={styles} />
							</View>

							<View style={{ marginTop: 6 }}>
								<Text style={[styles.infoLabel, { color: colors.textSecondary, marginTop: 4 }]}>Équipements</Text>
								{isEditing ? (
									<TextInput
										style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
										value={editValues.equipements}
										onChangeText={v => handleChange('equipements', v)}
										placeholder="Équipements (séparés par des virgules)"
									/>
								) : (
									<Text style={[styles.infoValue, { color: colors.text }]}>{Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-')}</Text>
								)}
							</View>

							<View style={styles.sectionRow}>
								<MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
								<Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Réservations :</Text>
							</View>
							<ReservationList reservations={bien.reservations} colors={colors} formatDateFR={formatDateFR} styles={styles} />

							<View style={styles.sectionRow}>
								<MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
								<Text style={{ color: colors.text, fontWeight: 'bold' }}>Tâches :</Text>
							</View>
							<TacheTimeline taches={bien.taches} colors={colors} formatDateFR={formatDateFR} styles={styles} />

							<View style={styles.sectionRow}>
								<MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
								<Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
							</View>
							<PrestationTimeline prestations={bien.prestations} colors={colors} formatDateFR={formatDateFR} styles={styles} />

							<View style={{ marginTop: 10, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
								<Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Total perçu (prestations)</Text>
								<Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{Number(totalPrestationPercu || 0).toFixed(2)} €</Text>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

export default React.memo(BienCard);

