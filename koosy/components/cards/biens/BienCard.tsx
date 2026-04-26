import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../../../screens/Layout/styles/BienScreen.styles';
import type { Bien } from '../../../models/models';
import { Carrousel } from '../../../ui/Carrousel';
import ButtonAction from '../../../ui/ButtonAction';

// ============================================================================
// PROPS DU COMPOSANT
// ============================================================================
// BienCardProps : definit les donnees attendues par le composant BienCard
// - bien : le bien immobilier avec ses informations (photos, equipements, etc.)
// - totalPrestationPercu : somme totale des prestations percues pour ce bien
// - colors : palette de couleurs pour le theme
// - onEdit : callback pour sauvegarder les modifications du bien
// - onDelete : callback pour supprimer le bien
// - onStatus : callback pour changer le statut du bien (disponible/occupe)
// - onPhotoPress : callback quand on clique sur une photo du carrousel
// - formatDateFR : fonction pour formater les dates en francais

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

// ============================================================================
// OPTIMISATION DE RENDU (MEMOIZATION)
// ============================================================================
// shouldReRender : decide si le composant doit se re-rendre.
// PROBLEME : useTheme() recree un nouvel objet colors a chaque render,
// donc prev.colors === next.colors (comparaison par reference) echoue toujours
// et force un re-render. On compare maintenant les valeurs des couleurs.
const shouldReRender = (prev: Readonly<BienCardProps>, next: Readonly<BienCardProps>) => {
  if (prev.bien !== next.bien) return false;
  if (prev.totalPrestationPercu !== next.totalPrestationPercu) return false;
  // Comparaison par valeur des couleurs (important : useTheme() recree un nouvel
  // objet a chaque render, donc la comparaison par reference echouerait systematiquement)
  const pc = prev.colors;
  const nc = next.colors;
  if (pc.surface !== nc.surface || pc.primary !== nc.primary || pc.secondary !== nc.secondary ||
      pc.accent !== nc.accent || pc.error !== nc.error || pc.text !== nc.text || pc.textSecondary !== nc.textSecondary) return false;
  if (prev.onEdit !== next.onEdit) return false;
  if (prev.onDelete !== next.onDelete) return false;
  if (prev.onStatus !== next.onStatus) return false;
  if (prev.onPhotoPress !== next.onPhotoPress) return false;
  return true;
};

// ============================================================================
// COMPOSANTS INTERNES MEMOIZES (evitent les re-renders inutiles)
// ============================================================================

// ReservationItem : affiche une reservation dans la liste triee
const ReservationItem = React.memo(({ resa, colors, formatDateFR }: { resa: any; colors: BienCardProps['colors']; formatDateFR: (d?: string) => string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.accent + '22', borderColor: colors.accent, borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 2 }}>
    <MaterialCommunityIcons name="account" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 2 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>{resa.locataire?.nom || ''} {resa.locataire?.prenom || ''}</Text>
      {resa.locataire?.email ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.email}</Text> : null}
      {resa.locataire?.telephone ? <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.locataire.telephone}</Text> : null}
      <Text style={{ color: '#1976D2', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>{formatDateFR(resa.dateDebut)} - {formatDateFR(resa.dateFin)}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{resa.statut ? resa.statut.charAt(0).toUpperCase() + resa.statut.slice(1) : ''}</Text>
    </View>
  </View>
));

// TacheItem : affiche une tache dans la timeline avec cercle colore selon statut
const TacheItem = React.memo(({ tache, colors, formatDateFR }: { tache: any; colors: BienCardProps['colors']; formatDateFR: (d?: string) => string }) => (
  <View style={styles.timelineItem}>
    <MaterialCommunityIcons name="circle" size={10} color={tache.statut === 'a faire' ? colors.error : colors.accent} style={{ marginRight: 6 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontWeight: '500' }}>{tache.titre || 'N/A'}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{tache.statut} {tache.dateEcheance ? `- ${formatDateFR(tache.dateEcheance)}` : ''}</Text>
    </View>
  </View>
));

// PrestationItem : affiche une prestation dans la timeline avec cercle colore selon status
const PrestationItem = React.memo(({ prestation, colors, formatDateFR }: { prestation: any; colors: BienCardProps['colors']; formatDateFR: (d?: string) => string }) => (
  <View style={styles.timelineItem}>
    <MaterialCommunityIcons name="circle" size={10} color={prestation.status === 'terminee' ? colors.accent : colors.error} style={{ marginRight: 6 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontWeight: '500' }}>{prestation.description || 'N/A'}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        {prestation.status} {prestation.date_prestation ? `- ${formatDateFR(prestation.date_prestation)}` : ''}
        {typeof prestation.amount_cents === 'number' && prestation.amount_cents > 0 ? ` - ${(prestation.amount_cents / 100).toFixed(2)} EUR` : ''}
      </Text>
    </View>
  </View>
));

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
function BienCard(props: BienCardProps) {
	// -----------------------------------------------------------------------------
	// EXTRACTION DES PROPS
	// -----------------------------------------------------------------------------
	const { bien, totalPrestationPercu, colors, onEdit, onDelete, onStatus, onPhotoPress, formatDateFR } = props;

	// -----------------------------------------------------------------------------
	// ETAT LOCAL : mode edition
	// isEditing : vrai quand l'utilisateur est en train de modifier les infos du bien
	// -----------------------------------------------------------------------------
	const [isEditing, setIsEditing] = useState(false);

	// -----------------------------------------------------------------------------
	// ETAT LOCAL : expansion des details
	// expanded : vrai quand la section "details" est visible (proprietaire, reservations, etc.)
	// -----------------------------------------------------------------------------
	const [expanded, setExpanded] = useState(false);

	// -----------------------------------------------------------------------------
	// ETAT LOCAL : valeurs temporaires pour l'edition inline
	// editValues : stocke les valeurs modifiees avant validation (nom, adresse, type, etc.)
	// -----------------------------------------------------------------------------
	const [editValues, setEditValues] = useState({
		nom: bien.nom || '',
		adresse: bien.adresse || '',
		type: bien.type || '',
		superficie: bien.superficie ? String(bien.superficie) : '',
		pieces: bien.pieces ? String(bien.pieces) : '',
		equipements: Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || ''),
	});

	// -----------------------------------------------------------------------------
	// ETAT LOCAL : proprietaire local
	// localProprio : copie locale du proprietaire pour affichage (peut etre modifie sans impacter le bien)
	// -----------------------------------------------------------------------------
	const [localProprio, setLocalProprio] = useState(bien.proprio);

	// -----------------------------------------------------------------------------
	// handlerChange : met a jour une valeur du formulaire d'edition
	// -----------------------------------------------------------------------------
	const handleChange = (field: keyof typeof editValues, value: string) => {
		setEditValues(prev => ({ ...prev, [field]: value }));
	};

	// -----------------------------------------------------------------------------
	// COULEURS DU STATUT (memoized)
	// statutColor : couleur du texte selon le statut (vert=disponible, rouge=occupe, orange=autre)
	// statutBg : couleur de fond du badge selon le statut
	// -----------------------------------------------------------------------------
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

	// -----------------------------------------------------------------------------
	// Reservations triees par date de debut (memoize pour eviter le tri a chaque render)
	// -----------------------------------------------------------------------------
	const sortedReservations = useMemo(() => {
		if (!bien.reservations || bien.reservations.length === 0) return [];
		return [...bien.reservations].sort((a: any, b: any) => new Date(a.dateDebut ?? 0).getTime() - new Date(b.dateDebut ?? 0).getTime());
	}, [bien.reservations]);

	// -----------------------------------------------------------------------------
	// handleEditPress : gere le toggle entre mode consultation et mode edition
	// - Si isEditing=true : valide les modifications et appelle onEdit, puis sort du mode edition
	// - Si isEditing=false : entre en mode edition
	// -----------------------------------------------------------------------------
	const handleEditPress = () => {
		if (isEditing) {
			// Construit le payload avec les valeurs modifiees (convertit les types)
			const payload: any = {
				nom: editValues.nom,
				adresse: editValues.adresse,
				type: editValues.type,
				superficie: Number(editValues.superficie),
				pieces: Number(editValues.pieces),
				equipements: editValues.equipements.split(',').map((e: string) => e.trim()).filter(Boolean),
			};
			// Preserve les champs non modifiables (statut, coordonnees GPS)
			if (bien.statut) payload.statut = bien.statut;
			if (bien.lat) payload.lat = bien.lat;
			if (bien.lng) payload.lng = bien.lng;
			// Envoie les modifications au parent
			onEdit({ id: bien.id, ...payload });
			setIsEditing(false);
		} else {
			setIsEditing(true);
		}
	};

	// -----------------------------------------------------------------------------
	// handleCancelEdit : annule les modifications en cours
	// Reinitialise editValues avec les valeurs actuelles du bien et quitte le mode edition
	// -----------------------------------------------------------------------------
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
		// ========================================================================
		// CARTE PRINCIPALE DU BIEN
		// ========================================================================
		<View style={[styles.card, { backgroundColor: colors.surface }]}>

			{/* ====================================================================
			 EN-TETE : Nom du bien + Date de creation + Badge statut
			 ==================================================================== */}
			<View style={styles.denseHeaderRow}>
				<View style={styles.denseHeaderLeft}>
					{/* Affichage conditionnel : TextInput si edition, Text sinon */}
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
					{/* Date de creation formatee en francais */}
					<Text style={{ fontSize: 13, color: colors.textSecondary }}>
						Cree le {bien.dateCreation ? formatDateFR(bien.dateCreation) : formatDateFR(new Date().toISOString().slice(0, 10))}
					</Text>
				</View>
				{/* Badge cliquable pour changer le statut (desactive en mode edition) */}
				<TouchableOpacity
					onPress={() => onStatus(bien)}
					disabled={isEditing}
					style={[styles.statusPill, { backgroundColor: statutBg }]}
				>
					<Text style={{ fontSize: 12, fontWeight: '700', color: statutColor }}>{bien.statut || '-'}</Text>
				</TouchableOpacity>
			</View>

			{/* ====================================================================
			 CARROUSEL DE PHOTOS
			 Affiche les photos du bien si elles existent, avec callback au clic
			 ==================================================================== */}
			{Array.isArray(bien.photos) && bien.photos.length > 0 && (
				<Carrousel
					photos={bien.photos}
					onPhotoPress={onPhotoPress}
					style={styles.carouselDense}
					photoStyle={styles.carouselPhotoDense}
				/>
			)}

			{/* ====================================================================
			 GRILLE D'INFOS : Type | Superficie | Pieces
			 Affichage compact sur 3 colonnes, editable en inline
			 ==================================================================== */}
			<View style={styles.infoGridDense}>
				{/* Colonne Type */}
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
				{/* Colonne Superficie */}
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
				{/* Colonne Pieces */}
				<View style={styles.infoCol}>
					<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Pieces</Text>
					{isEditing ? (
						<TextInput
							style={[styles.infoValue, { color: colors.text, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.primary }]}
							value={editValues.pieces}
							onChangeText={v => handleChange('pieces', v)}
							placeholder="Nb pieces"
							keyboardType="numeric"
						/>
					) : (
						<Text style={[styles.infoValue, { color: colors.text }]}>{bien.pieces || '-'}</Text>
					)}
				</View>
			</View>

			{/* ====================================================================
			 LIGNE ADRESSE + BOUTON VOIR/MASQUER DETAILS
			 ==================================================================== */}
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
				{/* Toggle pour afficher/masquer la section details etendue */}
				<TouchableOpacity onPress={() => setExpanded(!expanded)} style={[styles.detailsToggle, { borderColor: colors.primary }]}>
					<Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>
						{expanded ? 'Masquer details' : 'Voir details'}
					</Text>
				</TouchableOpacity>
			</View>

			{/* ====================================================================
			 LIGNE PROPRIETAIRE (affichage resume)
			 ==================================================================== */}
			<View style={{ marginTop: 8 }}>
				<Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: 12 }}>
					Proprietaire: {localProprio?.nom || localProprio?.email || 'Non renseigne'}
				</Text>
			</View>

			{/* ====================================================================
			 BOUTONS D'ACTIONS : Editer / Supprimer
			 Le composant ButtonAction gere le changement d'etat (consultation <-> edition)
			 ==================================================================== */}
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

			{/* ====================================================================
			 SECTION DETAILS ETENDUS (affichee uniquement si expanded=true)
			 Contient : Proprietaire complet, Equipements, Reservations, Taches, Prestations, Total percu
			 ==================================================================== */}
			{expanded && (
				<View style={{ marginTop: 12 }}>

					{/* ------- Bloc Proprietaire ------- */}
					<View style={{ marginBottom: 10 }}>
						<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Proprietaire</Text>
						<View style={styles.proprioBox}>
							{/* Avatar avec icone utilisateur */}
							<View style={styles.avatarCircle}>
								<FontAwesome5 name="user-tie" size={18} color={colors.secondary} />
							</View>
							{/* Infos du proprietaire : nom, email, telephone */}
							<View style={{ flex: 1 }}>
								<Text style={{ color: colors.text, fontWeight: 'bold' }}>{localProprio?.nom || 'N/A'}</Text>
								<Text style={{ color: colors.textSecondary }}>{localProprio?.email || ''}</Text>
								<Text style={{ color: colors.textSecondary }}>{localProprio?.telephone || ''}</Text>
							</View>
						</View>
					</View>

					{/* ------- Bloc Equipements ------- */}
					<View style={{ marginBottom: 10 }}>
						<Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Equipements</Text>
						{/* Affiche la liste des equipements separes par des virgules */}
						<Text style={[styles.infoValue, { color: colors.text }]}>{Array.isArray(bien.equipements) ? bien.equipements.join(', ') : (bien.equipements || '-')}</Text>
					</View>

					{/* ------- Bloc Reservations ------- */}
					{/* En-tete avec icone calendrier */}
					<View style={styles.sectionRow}>
						<MaterialCommunityIcons name="calendar-check" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
						<Text style={{ color: colors.text, fontWeight: 'bold' }}>Reservations :</Text>
					</View>
					{/* Liste des reservations triees par date de debut */}
					{sortedReservations.length > 0 ? (
						<View style={{ width: '100%', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
							{sortedReservations.map((resa: any) => (
								<ReservationItem key={resa.id} resa={resa} colors={colors} formatDateFR={formatDateFR} />
							))}
						</View>
					) : (
						<Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune reservation</Text>
					)}

					{/* ------- Bloc Taches ------- */}
					{/* En-tete avec icone clipboard */}
					<View style={styles.sectionRow}>
						<MaterialCommunityIcons name="clipboard-list" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
						<Text style={{ color: colors.text, fontWeight: 'bold' }}>Taches :</Text>
					</View>
					{/* Timeline des taches : cercle colore selon le statut (rouge=a faire, vert=termine) */}
					{bien.taches && bien.taches.length > 0 ? (
						<View style={styles.timeline}>
							{bien.taches.map((tache: any) => (
								<TacheItem key={tache.id} tache={tache} colors={colors} formatDateFR={formatDateFR} />
							))}
						</View>
					) : (
						<Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune tache</Text>
					)}

					{/* ------- Bloc Prestations ------- */}
					{/* En-tete avec icone handshake */}
					<View style={styles.sectionRow}>
						<MaterialCommunityIcons name="handshake" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
						<Text style={{ color: colors.text, fontWeight: 'bold' }}>Prestations :</Text>
					</View>
					{/* Timeline des prestations : cercle colore selon status (vert=terminee, rouge=en cours) */}
					{bien.prestations && bien.prestations.length > 0 ? (
						<View style={styles.timeline}>
							{bien.prestations.map((prestation: any) => (
								<PrestationItem key={prestation.id} prestation={prestation} colors={colors} formatDateFR={formatDateFR} />
							))}
						</View>
					) : (
						<Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>Aucune prestation</Text>
					)}

					{/* ------- Bloc Total Percu ------- */}
					{/* Somme totale des montants des prestations pour ce bien */}
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
