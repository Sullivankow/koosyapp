// Écran listant les prestations (en attente, confirmées, terminées).
// - Charge les prestations via l'API
// - Permet de changer le statut ou de supprimer une prestation
// - Met à jour le compteur de prestations terminées et le chiffre d'affaires.
import BadgeStatus from '../../ui/BadgeStatus';
import { STATUS_CONFIG } from '../../constants/Status';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getPrestations, updatePrestationStatut, deletePrestation } from '../../utils/api';
import { Prestation } from '../../models/models';
import AddPrestationModal from '../../components/modals/AddPrestationModal';
import { usePrestationsCount } from '../../contexts/PrestationsCountContext';
import { useChiffreAffaireRefresh } from '../../contexts/ChiffreAffaireRefreshContext';
import { useGlobalRefresh } from '../../contexts/GlobalRefreshContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderWithAddButton from '../../ui/HeaderWithAddButton';
import { Alert } from 'react-native';


const statutColor: Record<string, string> = {
	'confirmée': '#43A047',
	'en attente': '#FF7043',
	'terminée': '#1976D2',
};

const TABS = [
  { key: 'en attente', label: 'En attente' },
  { key: 'confirmée', label: 'Confirmée' },
  { key: 'terminée', label: 'Terminée' },
];

const getContrastTextColor = (hexColor: string) => {
	const sanitized = hexColor.replace('#', '');
	if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) return '#fff';
	const r = parseInt(sanitized.slice(0, 2), 16);
	const g = parseInt(sanitized.slice(2, 4), 16);
	const b = parseInt(sanitized.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? '#111' : '#fff';
};


const PrestationsScreen: React.FC = () => {
	const { refreshPrestationsTerminees } = usePrestationsCount();
	const { colors } = useTheme();
	const statusPillColor = colors.primary;
	const activeStatusTextColor = getContrastTextColor(statusPillColor);
	const { signalRefresh } = useChiffreAffaireRefresh(); // Ajout du contexte CA
	const { lastRefresh } = useGlobalRefresh();
	const [prestations, setPrestations] = useState<Prestation[]>([]);
	const [loading, setLoading] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const [tab, setTab] = useState<'en attente' | 'confirmée' | 'terminée' | 'annulée'>('en attente');

	const getApiErrorMessage = (error: unknown) => {
		if (error instanceof Error && error.message) {
			try {
				const parsed = JSON.parse(error.message);
				if (parsed?.message) {
					return Array.isArray(parsed.message) ? parsed.message.join(' ') : parsed.message;
				}
			} catch {
				return error.message;
			}
			return error.message;
		}
		return 'Impossible de modifier le statut pour le moment.';
	};

	// Récupère les prestations depuis l'API et met à jour l'état local.
	// En cas d'erreur, on vide simplement la liste pour éviter un blocage d'affichage.
	const fetchPrestations = async () => {
		setLoading(true);
		try {
			const data = await getPrestations();
			setPrestations(data);
		} catch {
			setPrestations([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPrestations();
	}, [modalVisible, lastRefresh]);

		return (
			<View style={{ flex: 1, backgroundColor: colors.background }}>
				<HeaderWithAddButton
					title="Mes prestations"
					onAdd={() => setModalVisible(true)}
					colors={colors}
				/>
				<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 8 }}>
					{TABS.map(tabObj => (
						<TouchableOpacity
							key={tabObj.key}
							style={{
								paddingHorizontal: 16,
								paddingVertical: 8,
								borderRadius: 20,
								marginHorizontal: 6,
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: tab === tabObj.key ? statusPillColor : colors.surface,
								borderWidth: 1,
								borderColor: tab === tabObj.key ? statusPillColor : colors.border,
							}}
							onPress={() => setTab(tabObj.key as any)}
						>
							<Text style={{ color: tab === tabObj.key ? activeStatusTextColor : colors.text, fontWeight: 'bold' }}>{tabObj.label}</Text>
						</TouchableOpacity>
					))}
				</View>
				{loading ? (
					<ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
				) : (
					<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 32 }}>
							<Text style={[styles.title, { color: colors.primary }]}>Prestations {tab === 'terminée' ? 'terminées' : tab === 'confirmée' ? 'confirmées' : tab}</Text>
								{prestations.filter(p => p.status === TABS.find(t => t.key === tab)?.label).length === 0 ? (
									<Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 24 }}>Aucune prestation {tab === 'terminée' ? 'terminée' : tab === 'confirmée' ? 'confirmées' : TABS.find(t => t.key === tab)?.label.toLowerCase()}</Text>
								) : (
									prestations.filter(p => p.status === TABS.find(t => t.key === tab)?.label).map((p: Prestation) => (
										<View key={p.id} style={[styles.card, { borderLeftColor: statutColor[p.status] || colors.primary }]}> 
											<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
												<Text style={styles.cardTitle}>{p.bien?.nom || 'Bien inconnu'}</Text>
												<TouchableOpacity
													onPress={() => {
														Alert.alert(
															'Confirmation',
															'Voulez-vous vraiment supprimer cette prestation ?',
															[
																{ text: 'Annuler', style: 'cancel' },
																{ text: 'Supprimer', style: 'destructive', onPress: async () => {
																		await deletePrestation(p.id);
																		await fetchPrestations();
																		if (refreshPrestationsTerminees) refreshPrestationsTerminees();
																	}},
															]
														);
													}}
													style={{ marginLeft: 8, padding: 4 }}>
													<MaterialCommunityIcons name="delete" size={22} color={colors.primary} />
												</TouchableOpacity>
											</View>
											<Text style={{ color: '#111', fontWeight: 'bold', fontSize: 16 }}>{p.description || 'Sans description'}</Text>
											<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Montant : {(p.amount_cents / 100).toFixed(2)} €</Text>
											<Text style={{ color: colors.textSecondary, fontSize: 14 }}>Créée le : {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : ''}</Text>
															<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, marginBottom: 2 }}>
																{['en attente', 'confirmée', 'terminée'].map((s) => {
																	const isActive = p.status === STATUS_CONFIG[s]?.label || p.status === s;
																	const isAlreadyCompleted = (p.status || '').toLocaleLowerCase('fr-FR') === 'terminée';
																	const isLockedByCompleted = isAlreadyCompleted && s !== 'terminée';
																	const handleStatusChange = async () => {
																		try {
																			await updatePrestationStatut(p.id, STATUS_CONFIG[s]?.label || s);
																			await fetchPrestations();
																			if (refreshPrestationsTerminees) refreshPrestationsTerminees();
																			signalRefresh();
																		} catch (error) {
																			Alert.alert('Impossible de modifier le statut', getApiErrorMessage(error));
																		}
																	};
																	return (
																		<TouchableOpacity
																			key={s}
																			disabled={isActive || isLockedByCompleted}
																			onPress={async () => {
																				if (isActive || isLockedByCompleted) return;
																				if (s === 'terminée') {
																					Alert.alert(
																						'Confirmation',
																						'Êtes vous sûr de vouloir valider cette prestation ?',
																						[
																							{ text: 'Annuler', style: 'cancel' },
																							{ text: 'Valider', onPress: () => { void handleStatusChange(); } },
																						]
																					);
																					return;
																				}
																				await handleStatusChange();
																			}}
																			style={{ opacity: isActive || isLockedByCompleted ? 1 : 0.5, marginRight: 6 }}
																		>
																			<BadgeStatus
																				statut={s}
																				style={{
																					backgroundColor: statusPillColor,
																					paddingHorizontal: 10,
																					paddingVertical: 3,
																					borderRadius: 11,
																				}}
																			/>
																		</TouchableOpacity>
																	);
																})}
															</View>
				</View>
			))
		)}
	<AddPrestationModal
		visible={modalVisible}
		onClose={() => setModalVisible(false)}
		onSuccess={async () => {
			setModalVisible(false);
			await fetchPrestations();
			if (refreshPrestationsTerminees) refreshPrestationsTerminees();
			signalRefresh();
		}}
	/>
	</ScrollView>
				)}
			</View>
		);
};

const styles = StyleSheet.create({
	title: { fontSize: 26, fontWeight: 'bold', margin: 18 },
	card: { borderRadius: 16, padding: 16, marginBottom: 18, elevation: 2, backgroundColor: '#fff', borderLeftWidth: 6 },
	cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
	fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});

export default PrestationsScreen;