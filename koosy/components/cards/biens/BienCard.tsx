import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../../../screens/Layout/styles/BienScreen.styles';
import type { Bien } from '../../../models/models';
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

const shouldReRender = (prev: Readonly<BienCardProps>, next: Readonly<BienCardProps>) => {
  return (
    prev.bien === next.bien &&
    prev.totalPrestationPercu === next.totalPrestationPercu &&
    prev.colors === next.colors &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete &&
    prev.onStatus === next.onStatus &&
    prev.onPhotoPress === next.onPhotoPress &&
    prev.formatDateFR === next.formatDateFR
  );
};

function BienCard(props: BienCardProps) {
	const { bien, totalPrestationPercu, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR } = props;
	const [isEditing, setIsEditing] = useState(false);
	const [expanded, setExpanded] = useState(false);
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
				<TouchableOpacity onPress={() => setExpanded(!expanded)} style={[styles.detailsToggle, { borderColor: colors.primary }]}>
					<Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
						{expanded ? 'Masquer détails' : 'Voir détails'}
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

			{expanded && (
				<View style={{ marginTop: 12 }}>
					<View style={{ marginBottom: 10 }}>
						<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Proprietaire</Text>
						<View style={styles.proprioBox}>
							<View style={styles.avatarCircle}>
								<FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
							</View>
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text, fontWeight: 'bold' }}>{localProprio?.nom || 'N/A'}</Text>
								<Text style={{ color: colors.textSecondary }}>{localProprio?.email || ''}</Text>
								<Text style={{ color: colors.textSecondary }}>{localProprio?.telephone || ''}</Text>
							</View>
						</View>
					</View>

					<View style={{ marginBottom: 10 }}>
						<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Equipements</Text>
						<Text style={[styles.infoValue, { color: colors.text }]}>{Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-')}</Text>
					</View>

					<View style={styles.sectionRow}>
						<MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
						<Text style={{ color: colors.text, fontWeight: 'bold' }}>Reservations :</Text>
					</View>
					{bien.reservations && bien.reservations.length > 0 ? (
						<View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
							{[...bien.reservations].sort((a: any, b: any) => new Date(a.dateDebut ?? 0).getTime() - new Date(b.dateDebut ?? 0).getTime()).map((resa: any) => (
								<View key={resa.id} style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.accent + '22', borderColor: colors.accent, borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 2 }}>
									<MaterialCommunityIcons name="account" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
									<View style={{ flex: 1 }}>
										<Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>{resa.locataire?.nom || ''} {resa.locataire?.prenom || ''}</Text>
										{resa.locataire?.email ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.email}</Text> : null}
										{resa.locataire?.telephone ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.telephone}</Text> : null}
										<Text style={{ color: '#1976D2', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{formatDateFR(resa.dateDebut)} - {formatDateFR(resa.dateFin)}</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.statut ? resa.statut.charAt(0).toUpperCase() + resa.statut.slice(1) : ''}</Text>
									</View>
								</View>
							))}
						</View>
					) : (
						<Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune reservation</Text>
					)}

					<View style={styles.sectionRow}>
						<MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
						<Text style={{ color: colors.text, fontWeight: 'bold' }}>Taches :</Text>
					</View>
					{bien.taches && bien.taches.length > 0 ? (
						<View style={styles.timeline}>
							{bien.taches.map((tache: any) => (
								<View key={tache.id} style={styles.timelineItem}>
									<MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'a faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
									<View style={{ flex: 1 }}>
										<Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre || 'N/A'}</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
									</View>
								</View>
							))}
						</View>
					) : (
						<Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tache</Text>
					)}

					<View style={styles.sectionRow}>
						<MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
						<Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
					</View>
					{bien.prestations && bien.prestations.length > 0 ? (
						<View style={styles.timeline}>
							{bien.prestations.map((prestation: any) => (
								<View key={prestation.id} style={styles.timelineItem}>
									<MaterialCommunityIcons name="circle" size={10} color={prestation.status === 'terminee' ? colors.accent : colors.error} style={{ marginRight: 6 }} />
									<View style={{ flex: 1 }}>
										<Text style={{ color: colors.text, fontWeight: '500' }}>{prestation.description || 'N/A'}</Text>
										<Text style={{ color: colors.textSecondary, fontSize: 12 }}>
											{prestation.status} {prestation.date_prestation ? `- ${formatDateFR(prestation.date_prestation)}` : ''}
											{typeof prestation.amount_cents === 'number' && prestation.amount_cents > 0 ? ` - ${(prestation.amount_cents / 100).toFixed(2)} EUR` : ''}
										</Text>
									</View>
								</View>
							))}
						</View>
					) : (
						<Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune prestation</Text>
					)}

					<View style={{ marginTop: 10, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
						<Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Total percu (prestations)</Text>
						<Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{Number(totalPrestationPercu || 0).toFixed(2)} EUR</Text>
					</View>
				</View>
			)}
		</View>
	);
}

export default React.memo(BienCard, shouldReRender);

