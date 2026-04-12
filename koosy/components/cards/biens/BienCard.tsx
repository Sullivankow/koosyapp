import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProprioBox from './ProprioBox';
import { styles } from '../../../screens/Layout/styles/BienScreen.styles';
import { getProprietaires } from '../../../utils/api';
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

const BienCard: React.FC<BienCardProps> = ({ bien, totalPrestationPercu, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValues, setEditValues] = useState({
		nom: bien.nom || '',
		adresse: bien.adresse || '',
		type: bien.type || '',
		superficie: bien.superficie ? String(bien.superficie) : '',
		pieces: bien.pieces ? String(bien.pieces) : '',
		equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
	});
	// Suppression de la sélection du propriétaire en édition

	// Suppression de la récupération des propriétaires en édition

	const handleChange = (field: keyof typeof editValues, value: string) => {
		setEditValues(prev => ({ ...prev, [field]: value }));
	};

	const [localProprio, setLocalProprio] = useState(bien.proprio);

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
			{/* Nom du bien */}
			{isEditing ? (
				<TextInput
					style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }}
					value={editValues.nom}
					onChangeText={v => handleChange('nom', v)}
					placeholder="Nom du bien"
				/>
			) : (
				<Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 }}>{bien.nom || 'Sans nom'}</Text>
			)}
			<Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
				Créé le {bien.dateCreation ? formatDateFR(bien.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
			</Text>
			{Array.isArray(bien.photos) && bien.photos.length > 0 && (
				<Carrousel
					photos={bien.photos}
					onPhotoPress={onPhotoPress}
					style={styles.carousel}
					photoStyle={styles.carouselPhoto}
				/>
			)}
			{/* Infos principales */}
			<View style={styles.infoGrid}>
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
				<View style={styles.infoCol}>
					<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Statut</Text>
					<TouchableOpacity onPress={() => onStatus(bien)} disabled={isEditing}>
						<Text style={[styles.infoValue, { color: bien.statut === 'disponible' ? 'green' : bien.statut === 'occupé' ? 'red' : colors.accent }]}>{bien.statut || '-'}</Text>
					</TouchableOpacity>
				</View>
			</View>
			{/* Adresse et équipements */}
			<View style={{ marginTop: 8 }}>
				<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Adresse</Text>
				{isEditing ? (
					<TextInput
						style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
						value={editValues.adresse}
						onChangeText={v => handleChange('adresse', v)}
						placeholder="Adresse"
					/>
				) : (
					<Text style={[styles.infoValue, { color: colors.text }]}>{bien.adresse || '-'}</Text>
				)}
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
			{/* Propriétaire */}
			<View style={{ marginTop: 8 }}>
				<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Propriétaire</Text>
				<ProprioBox proprio={localProprio} colors={colors} styles={styles} />
			</View>
			{/* Réservations */}
			<View style={styles.sectionRow}>
				<MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
				<Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 6 }}>Réservations :</Text>
			</View>
			<ReservationList reservations={bien.reservations} colors={colors} formatDateFR={formatDateFR} styles={styles} />
			{/* Tâches */}
			<View style={styles.sectionRow}>
				<MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
				<Text style={{ color: colors.text, fontWeight: 'bold' }}>Tâches :</Text>
			</View>
			<TacheTimeline taches={bien.taches} colors={colors} formatDateFR={formatDateFR} styles={styles} />
			{/* Prestations */}
			<View style={styles.sectionRow}>
				<MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
				<Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
			</View>
			<PrestationTimeline prestations={bien.prestations} colors={colors} formatDateFR={formatDateFR} styles={styles} />
			{/* Total perçu sur ce bien (prestations terminées agrégées) */}
			<View style={{ marginTop: 10, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
				<Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Total perçu (prestations)</Text>
				<Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{Number(totalPrestationPercu || 0).toFixed(2)} €</Text>
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
		</View>
	);
};

export default BienCard;

