import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { deleteEntreprise } from '../utils/api';

// Type Entreprise strictement aligné sur le backend
export interface Entreprise {
	nom: string;
	siret: string;
	tva?: string;
	adresse?: string;
	codePostal?: string;
	ville?: string;
	pays?: string;
	email?: string;
	telephone?: string;
	siteWeb?: string;
	logo?: string;
}

interface EntrepriseProfileCardProps {
	entreprise: Entreprise;
	onEdit?: () => void;
	onDelete?: () => void;
}


import { updateEntreprise } from '../utils/api';

const EntrepriseProfileCard: React.FC<EntrepriseProfileCardProps> = ({ entreprise, onEdit, onDelete }) => {
	const { colors } = useTheme();
	const [modeEdition, setModeEdition] = useState(false);

		const [editEntreprise, setEditEntreprise] = useState(entreprise);

		// Synchronise le formulaire avec la prop entreprise à chaque mise à jour
		React.useEffect(() => {
			setEditEntreprise(entreprise);
		}, [entreprise]);

	// Fonction appelée lors de la sauvegarde des modifications de l'entreprise
	const handleSave = async () => {
		try {
			// On ne garde que les champs attendus par le backend
			const data = {
				nom: editEntreprise.nom,
				siret: editEntreprise.siret,
				tva: editEntreprise.tva,
				adresse: editEntreprise.adresse,
				codePostal: editEntreprise.codePostal,
				ville: editEntreprise.ville,
				pays: editEntreprise.pays,
				email: editEntreprise.email,
				telephone: editEntreprise.telephone,
				siteWeb: editEntreprise.siteWeb,
				logo: editEntreprise.logo,
			};
			// Vérification rapide côté front (SIRET)
			if (!data.siret || data.siret.length !== 14) {
				Alert.alert('Erreur', 'Le SIRET doit contenir exactement 14 chiffres.');
				return;
			}
			// On caste temporairement pour l'appel API car id n'est plus dans le type Entreprise (mais il est bien présent dans l'objet reçu)
			await updateEntreprise((editEntreprise as any).id, data);
			setModeEdition(false);
			Alert.alert('Succès', 'Informations de l’entreprise mises à jour.');
			if (onEdit) onEdit();
		} catch (error: any) {
			console.error('Erreur updateEntreprise:', error);
			let msg = "Impossible de mettre à jour l'entreprise.";
			if (error && error.message) {
				msg += `\n${error.message}`;
			}
			Alert.alert('Erreur', msg);
		}
	};

	const handleDelete = async () => {
		console.log('Suppression entreprise id:', (entreprise as any).id);
		try {
			await deleteEntreprise((entreprise as any).id);
			Alert.alert('Succès', 'Entreprise supprimée avec succès.');
			if (onEdit) onEdit();
		} catch (error: any) {
			console.error('Erreur suppression entreprise:', error);
			Alert.alert('Erreur', "Impossible de supprimer l'entreprise.\n" + (typeof error === 'string' ? error : error && error.toString ? error.toString() : ''));
		}
	};

	return (
		<View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.text }]}>  
			<View style={{ alignItems: 'center', marginBottom: 18 }}>
				{entreprise.logo ? (
					<Image source={{ uri: entreprise.logo }} style={styles.logo} />
				) : (
					<MaterialCommunityIcons name="office-building" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
				)}
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
						value={editEntreprise.nom}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, nom: v })}
						placeholder="Raison sociale"
						placeholderTextColor={colors.text}
					/>
				) : (
					<Text style={[styles.nom, { color: colors.text }]}>{entreprise.nom}</Text>
				)}
				<Text style={[styles.formuleBadge, { backgroundColor: colors.secondary, color: '#000' }]}>Entreprise</Text>
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="identifier" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.siret}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, siret: v })}
						placeholder="SIRET"
						placeholderTextColor={colors.text}
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.siret}</Text>
				)}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="file-certificate" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.tva || ''}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, tva: v })}
						placeholder="Numéro TVA (optionnel)"
						placeholderTextColor={colors.text}
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.tva || '-'}</Text>
				)}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
				   {modeEdition ? (
					   <TextInput
						   style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						   value={editEntreprise.adresse || ''}
						   onChangeText={v => setEditEntreprise({ ...editEntreprise, adresse: v })}
						   placeholder="Adresse"
						   placeholderTextColor={colors.text}
					   />
				   ) : (
					   <Text style={[styles.infoText, { color: colors.text }]}>{entreprise.adresse || '-'}</Text>
				   )}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.codePostal || ''}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, codePostal: v })}
						placeholder="Code postal"
						placeholderTextColor={colors.text}
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.codePostal || '-'}</Text>
				)}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="city" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.ville || ''}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, ville: v })}
						placeholder="Ville"
						placeholderTextColor={colors.text}
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.ville || '-'}</Text>
				)}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="earth" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.pays || ''}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, pays: v })}
						placeholder="Pays"
						placeholderTextColor={colors.text}
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.pays || '-'}</Text>
				)}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="email" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.email || ''}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, email: v })}
						placeholder="Email"
						placeholderTextColor={colors.text}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.email || '-'}</Text>
				)}
			</View>
			<View style={styles.infoRow}>
				<FontAwesome name="phone" size={20} color={colors.primary} />
				   {modeEdition ? (
					   <TextInput
						   style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						   value={editEntreprise.telephone || ''}
						   onChangeText={v => setEditEntreprise({ ...editEntreprise, telephone: v })}
						   placeholder="Téléphone"
						   placeholderTextColor={colors.text}
						   keyboardType="phone-pad"
					   />
				   ) : (
					   <Text style={[styles.infoText, { color: colors.text }]}>{entreprise.telephone || '-'}</Text>
				   )}
			</View>
			<View style={styles.infoRow}>
				<MaterialCommunityIcons name="web" size={20} color={colors.primary} />
				{modeEdition ? (
					<TextInput
						style={[styles.input, { color: colors.text, borderColor: colors.primary, marginLeft: 8, flex: 1 }]}
						value={editEntreprise.siteWeb || ''}
						onChangeText={v => setEditEntreprise({ ...editEntreprise, siteWeb: v })}
						placeholder="Site web"
						placeholderTextColor={colors.text}
						autoCapitalize="none"
					/>
				) : (
					<Text style={[styles.infoText, { color: colors.text }]}>{entreprise.siteWeb || '-'}</Text>
				)}
			</View>
			<View style={styles.actions}>
				<TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={() => modeEdition ? handleSave() : setModeEdition(true)}>
					<MaterialCommunityIcons name={modeEdition ? 'content-save' : 'account-edit'} size={20} color={colors.surface} />
					<Text style={[styles.btnText, { color: colors.surface }]}> {modeEdition ? 'Enregistrer' : 'Modifier'} </Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.btnDanger, { backgroundColor: '#d32f2f' }]} onPress={handleDelete}>
					<MaterialCommunityIcons name="delete" size={20} color={colors.surface} />
					<Text style={[styles.btnText, { color: colors.surface }]}>Supprimer</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		borderRadius: 18,
		padding: 28,
		width: '90%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 6,
		marginTop: 24,
	},
	logo: {
		width: 70,
		height: 70,
		borderRadius: 12,
		marginBottom: 10,
		resizeMode: 'contain',
		backgroundColor: '#f7f7f7',
	},
	nom: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 2,
		color: '#222',
	},
	formuleBadge: {
		backgroundColor: '#e0f7fa',
		color: '#000',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 4,
		fontSize: 14,
		marginTop: 4,
		marginBottom: 10,
		alignSelf: 'center',
		fontWeight: 'bold',
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	infoText: {
		marginLeft: 8,
		fontSize: 16,
		color: '#555',
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 6,
		fontSize: 16,
		marginBottom: 4,
		backgroundColor: 'transparent',
	},
	actions: {
		marginTop: 18,
	},
	btnPrimary: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#009688',
		padding: 12,
		borderRadius: 10,
		marginBottom: 10,
		justifyContent: 'center',
	},
	btnDanger: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#d32f2f',
		padding: 12,
		borderRadius: 10,
		justifyContent: 'center',
	},
	btnText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#fff',
	},
});

export default EntrepriseProfileCard;
